// api/assignments.js
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client on the backend with the service role key
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

/**
 * A helper function to get the authenticated user from the request headers.
 * @param {Request} req - The incoming request object.
 * @returns {User|null} The Supabase user object or null if not authenticated.
 */
async function getUser(req) {
  // Supabase automatically passes the user's auth token in the Authorization header.
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return null;
  }
  // Verify the token and get the user.
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

/**
 * The main handler for all requests to /api/assignments.
 * It routes the request to the appropriate logic based on the HTTP method.
 */
export default async function handler(req, res) {
  // First, ensure a user is making the request.
  const user = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Use a switch statement to handle different request types (GET, POST, DELETE).
  switch (req.method) {
    case 'GET': {
      // Fetch all assignments that belong to the current user, ordered by due date.
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(200).json(data);
    }

    case 'POST': {
      // Create a new assignment.
      const { name, date, description } = req.body;
      const { data, error } = await supabase
        .from('assignments')
        .insert({ name, date, description, user_id: user.id })
        .select()
        .single(); // .single() returns the created object instead of an array

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(201).json(data);
    }

    case 'DELETE': {
      // Delete an assignment using its ID from the query parameter.
      const { id } = req.query;
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // IMPORTANT: Security check to ensure users can only delete their own assignments.

      if (error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(204).end(); // 204 No Content is standard for a successful delete.
    }

    default:
      // If the request uses a method other than GET, POST, or DELETE, send an error.
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
