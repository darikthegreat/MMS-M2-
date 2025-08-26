// api/schedule.js
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client on the backend.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

/**
 * A helper function to get the authenticated user from the request headers.
 * @param {Request} req - The incoming request object.
 * @returns {User|null} The Supabase user object or null if not authenticated.
 */
async function getUser(req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

/**
 * The main handler for all requests to /api/schedule.
 * It routes the request to the appropriate logic based on the HTTP method.
 */
export default async function handler(req, res) {
  // Ensure a user is making the request.
  const user = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle different request types (GET, POST, PUT, DELETE).
  switch (req.method) {
    case 'GET': {
      // Fetch all schedule items belonging to the current user.
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data);
    }

    case 'POST': {
      // Create a new schedule item.
      const { name, subject, day, date, duration, color } = req.body;
      const { data, error } = await supabase
        .from('schedule_items')
        .insert({ name, subject, day, date, duration, color, user_id: user.id })
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(201).json(data);
    }

    case 'PUT': {
      // Update an existing schedule item (used for drag-and-drop).
      const { id, day, date } = req.body;
      const { data, error } = await supabase
        .from('schedule_items')
        .update({ day, date })
        .eq('id', id)
        .eq('user_id', user.id) // Security check
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data);
    }

    case 'DELETE': {
      // Delete a schedule item using its ID.
      const { id } = req.query;
      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Security check

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(204).end();
    }

    default:
      // Handle unsupported methods.
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
