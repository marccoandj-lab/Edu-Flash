import { Groq } from 'groq-sdk';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, model, temperature, response_format, max_tokens } = req.body;

    if (!messages || !model) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Pronađi sve ključeve u obliku GROQ_API_KEY_X
    const keys = Object.keys(process.env)
      .filter((key) => key.startsWith('GROQ_API_KEY_'))
      .map((key) => process.env[key])
      .filter(Boolean) as string[];

    // Fallback: Ako nema numerisanih ključeva, pokušaj sa starim VITE_GROQ_API_KEY ili običnim GROQ_API_KEY
    if (keys.length === 0) {
      const fallback = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
      if (fallback) {
        keys.push(fallback);
      }
    }

    if (keys.length === 0) {
      return res.status(500).json({ error: 'Nijedan Groq API ključ nije konfigurisan na serveru.' });
    }

    // Promešaj ključeve (Fisher-Yates algoritam) kako bi se ravnomerno trošili (Load Balancing)
    for (let i = keys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [keys[i], keys[j]] = [keys[j], keys[i]];
    }

    // Pokušaj sa svakim ključem redom
    let lastError: any = null;

    for (const apiKey of keys) {
      try {
        const groq = new Groq({ apiKey });
        
        const completion = await groq.chat.completions.create({
          messages,
          model,
          temperature,
          response_format,
          max_tokens
        });

        // Ako je uspelo, odmah vrati rezultat
        return res.status(200).json(completion);

      } catch (err: any) {
        lastError = err;
        console.warn(`Pokusaj sa jednim od kljuceva nije uspeo: ${err.message}`);
        // Ako je greška npr. 429 Rate Limit ili 401 Unauthorized, petlja prelazi na sledeći ključ!
        continue;
      }
    }

    // Ako svi ključevi puknu
    console.error('Svi API ključevi su iscrpljeni ili nevažeći. Poslednja greška:', lastError);
    return res.status(500).json({ 
      error: 'Trenutno su svi AI resursi iscrpljeni. Molimo pokušajte ponovo kasnije.',
      details: lastError?.message || 'Nepoznata greška'
    });

  } catch (error: any) {
    console.error('Fatalna greška u API ruti:', error);
    return res.status(500).json({ error: 'Interna greška na serveru.' });
  }
}
