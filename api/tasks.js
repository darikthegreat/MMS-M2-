
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {

  const token = req.headers.authorization.split(' ')[1];
  const { data: { user } } = await supabase.auth.getUser(token);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }


  if (req.method === 'GET') {

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {

    const { text } = req.body;
    const { data, error } = await supabase
      .from('tasks')
      .insert({ text: text, user_id: user.id })
      .select(); 
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0]);
  }
  
  // ... you would add similar logic for PUT (update) and DELETE requests ...
}
