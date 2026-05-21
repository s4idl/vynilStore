-- BORRAR TABLA ANTERIOR SI EXISTE
DROP TABLE IF EXISTS vinyls CASCADE;

-- 1. Crear tabla de Vinilos (Añadidas columnas description y tracklist)
CREATE TABLE vinyls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  price NUMERIC NOT NULL,
  type TEXT DEFAULT 'LP',
  availability TEXT DEFAULT 'disponible',
  year INTEGER,
  cover_url TEXT,
  disk_url TEXT,
  badge TEXT,
  badge_class TEXT,
  description TEXT,
  tracklist JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS en Vinilos
ALTER TABLE vinyls ENABLE ROW LEVEL SECURITY;

-- Políticas de Vinilos
-- SOLO los usuarios autenticados pueden ver los vinilos
CREATE POLICY "Vinyls are viewable by authenticated users."
  ON vinyls FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- SOLO los administradores pueden insertar, actualizar o borrar vinilos
CREATE POLICY "Only admins can insert vinyls."
  ON vinyls FOR INSERT
  WITH CHECK ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') );

CREATE POLICY "Only admins can update vinyls."
  ON vinyls FOR UPDATE
  USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') )
  WITH CHECK ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') );

CREATE POLICY "Only admins can delete vinyls."
  ON vinyls FOR DELETE
  USING ( EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') );

-- 3. Insertar los 20 Vinilos Reales con descripciones y tracklists
INSERT INTO vinyls (title, artist, price, year, type, availability, cover_url, description, tracklist) VALUES
('Blonde', 'Frank Ocean', 850, 2016, 'LP', 'disponible', 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526', 'El segundo álbum de estudio del cantautor estadounidense Frank Ocean. Es una obra maestra de R&B alternativo y pop vanguardista.', '{"Side A": ["Nikes", "Ivy", "Pink + White", "Be Yourself"], "Side B": ["Solo", "Skyline To", "Self Control", "Good Guy"]}'),
('Ctrl', 'SZA', 650, 2017, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/91AbZ7RgrEL.jpg', 'El álbum debut de SZA, aclamado por la crítica. Ctrl explora temas de autoestima, relaciones amorosas e inseguridades.', '{"Side A": ["Supermodel", "Love Galore", "Doves In The Wind", "Drew Barrymore"], "Side B": ["Prom", "The Weekend", "Go Gina", "Broken Clocks"]}'),
('After Hours', 'The Weeknd', 750, 2020, 'LP', 'disponible', 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36', 'El cuarto álbum de estudio de The Weeknd. Introduce una estética inspirada en el synth-pop de los 80s y el dark wave.', '{"Side A": ["Alone Again", "Too Late", "Hardest To Love", "Scared To Live"], "Side B": ["Snowchild", "Escape From LA", "Heartless", "Faith"]}'),
('channel ORANGE', 'Frank Ocean', 700, 2012, 'LP', 'disponible', 'https://upload.wikimedia.org/wikipedia/en/2/28/Channel_ORANGE.jpg', 'El álbum debut de Frank Ocean que redefinió el R&B moderno, mezclando soul, funk, jazz y pop.', '{"Side A": ["Start", "Thinkin Bout You", "Fertilizer", "Sierra Leone", "Sweet Life"], "Side B": ["Super Rich Kids", "Pilot Jones", "Crack Rock", "Pyramids"]}'),
('RUiDO', 'zizzy', 720, 2023, 'LP', 'disponible', 'https://images.genius.com/dc7a7bd7c997f3e9cc1f3bc0e15fa14d.1000x1000x1.png', 'El aclamado proyecto del artista regiomontano Zizzy, que forma parte de la agrupación Aquihayaquihay, experimentando con R&B y trap en español.', '{"Side A": ["INTRO", "RUiDO", "FANTASMA", "LUNA"], "Side B": ["MALA", "TIEMPO", "NOCHE", "FINAL"]}'),
('Starboy', 'The Weeknd', 680, 2016, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/814htMhuuML._UF350,350_QL50_.jpg', 'Ganador del Grammy, este álbum colaborativo cuenta con Daft Punk y marca una transición hacia un sonido pop más brillante.', '{"Side A": ["Starboy", "Party Monster", "False Alarm", "Reminder"], "Side B": ["Rockin", "Secrets", "True Colors", "Stargirl Interlude"]}'),
('X100PRE', 'Bad Bunny', 800, 2018, 'LP', 'disponible', 'https://i.scdn.co/image/ab67616d0000b273519266cd05491a5b5bc22d1e', 'El álbum debut en solitario de Bad Bunny que revolucionó la música urbana latina.', '{"Side A": ["NI BIEN NI MAL", "200 MPH", "¿Quién Tú Eres?", "Caro"], "Side B": ["Tenemos Que Hablar", "Otra Noche en Miami", "Ser Bichote", "Si Estuviésemos Juntos"]}'),
('YHLQMDLG', 'Bad Bunny', 850, 2020, 'LP', 'preventa', 'https://i.scdn.co/image/ab67616d0000b273548f7ec52da7313de0c5e4a0', 'Yo Hago Lo Que Me Da La Gana es el segundo disco de estudio del artista urbano puertorriqueño.', '{"Side A": ["La Difícil", "Pero Ya No", "La Santa", "Yo Perreo Sola"], "Side B": ["Bichiyal", "Soliá", "La Zona", "Safaera"]}'),
('DATA', 'Tainy', 900, 2023, 'Edición Limitada', 'disponible', 'https://cdn-images.dzcdn.net/images/cover/e73a2afb469cd0f06777b24b156d3f82/0x1900-000000-80-0-0.jpg', 'El magistral álbum debut de producción del legendario productor de reggaetón Tainy. Un viaje cyberpunk y electrónico.', '{"Side A": ["Obstáculo", "Pasieros", "Colmillo", "La Baby"], "Side B": ["Mojabi Ghost", "Volver", "Sci-Fi", "Corleone"]}'),
('ATP', 'nsqk', 580, 2024, 'LP', 'disponible', 'https://akamai.sscdn.co/letras/360x360/albuns/9/0/a/b/3709081754915204.jpg', 'Álbum de NSQK que explora emociones profundas con beats vanguardistas y sintetizadores melancólicos que definen el nuevo R&B mexicano.', '{"Side A": ["ATP", "MISA", "LO QUE QUEDA", "SIGO AQUÍ"], "Side B": ["BLANCO", "TIEMPO", "NADA", "FINAL"]}'),
('SAYONARA', 'Álvaro Díaz', 650, 2024, 'LP', 'preventa', 'https://i.scdn.co/image/ab67616d0000b273af1e2e143561cf4df9941f5b', 'El esperado álbum del rapero puertorriqueño Álvaro Díaz. Una mezcla melancólica de hip-hop y reggaetón alternativo.', '{"Side A": ["Te Vi En Mis Pesadillas", "Lentito", "1000 Canciones", "Gatillera"], "Side B": ["Fatal Fantasy", "Sayonara", "Mami 100", "En PR No Hace Frío"]}'),
('AM', 'Arctic Monkeys', 650, 2013, 'LP', 'disponible', 'https://i.scdn.co/image/ab67616d0000b2734ae1c4c5c45aabe565499163', 'El icónico quinto álbum de Arctic Monkeys que mezcla rock indie, stoner rock y R&B.', '{"Side A": ["Do I Wanna Know?", "R U Mine?", "One for the Road", "Arabella", "I Want It All", "No.1 Party Anthem"], "Side B": ["Mad Sounds", "Fireside", "Why''d You Only Call Me When You''re High?", "Snap Out of It", "Knee Socks", "I Wanna Be Yours"]}'),
('Currents', 'Tame Impala', 720, 2015, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/910jbac3EEL._UF1000,1000_QL80_.jpg', 'Kevin Parker da un giro hacia el pop psicodélico, la música disco y el R&B en Currents.', '{"Side A": ["Let It Happen", "Nangs", "The Moment", "Yes I''m Changing"], "Side B": ["Eventually", "Gossip", "The Less I Know the Better", "Past Life"]}'),
('Random Access Memories', 'Daft Punk', 850, 2013, 'Edición Limitada', 'disponible', 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f542d937', 'El último y más ambicioso álbum del dúo francés. Un tributo analógico a la música funk, disco y soft rock de finales de los 70.', '{"Side A": ["Give Life Back to Music", "The Game of Love", "Giorgio by Moroder", "Within", "Instant Crush"], "Side B": ["Lose Yourself to Dance", "Touch", "Get Lucky", "Beyond", "Motherboard", "Fragments of Time", "Doin'' it Right", "Contact"]}'),
('IGOR', 'Tyler, The Creator', 700, 2019, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/81MJUW7iUaL.jpg', 'Un álbum conceptual de neo-soul y hip-hop que narra el arco completo de un triángulo amoroso doloroso.', '{"Side A": ["IGOR''S THEME", "EARFQUAKE", "I THINK", "EXACTLY WHAT YOU RUN FROM YOU END UP CHASING", "RUNNING OUT OF TIME", "NEW MAGIC WAND"], "Side B": ["A BOY IS A GUN", "PUPPET", "WHAT''S GOOD", "GONE, GONE / THANK YOU", "I DON''T LOVE YOU ANYMORE", "ARE WE STILL FRIENDS?"]}'),
('Flower Boy', 'Tyler, The Creator', 680, 2017, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/71Ls2qvxPjL.jpg', 'Una obra exuberante, sincera y melódica donde Tyler se abre sobre la soledad y su identidad.', '{"Side A": ["Foreword", "Where This Flower Blooms", "Sometimes...", "See You Again", "Who Dat Boy", "Pothole", "Garden Shed"], "Side B": ["Boredom", "I Ain''t Got Time!", "911 / Mr. Lonely", "Droppin'' Seeds", "November", "Glitter", "Enjoy Right Now, Today"]}'),
('good kid, m.A.A.d city', 'Kendrick Lamar', 750, 2012, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/71tsUaTfQIL._UF1000,1000_QL80_.jpg', 'Un cortometraje de Kendrick Lamar. Este álbum conceptual relata sus experiencias adolescentes creciendo en las duras calles de Compton.', '{"Side A": ["Sherane a.k.a Master Splinter''s Daughter", "Bitch, Don''t Kill My Vibe", "Backseat Freestyle", "The Art of Peer Pressure"], "Side B": ["Money Trees", "Poetic Justice", "good kid", "m.A.A.d city"]}'),
('What Could Possibly Go Wrong', 'Dominic Fike', 720, 2020, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/81CPCw32tOL._UF1000,1000_QL80_.jpg', 'El álbum debut de Dominic Fike que mezcla indie pop, hip hop alternativo y guitarras melódicas.', '{"Side A": ["Come Here", "Double Negative", "Cancel Me", "10x", "Vampire", "Superstar Sh*t", "Politics & Violence"], "Side B": ["Joe Blazey", "Wurli", "Florida", "Queen of England", "Chicken Tenders", "Whats For Dinner?", "Good Game"]}'),
('Circles', 'Mac Miller', 600, 2020, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/61ON2YOQPUL._UF1000,1000_QL80_DpWeblab_.jpg', 'El sexto y último álbum de estudio de Mac Miller, concebido como un álbum hermano de su anterior proyecto Swimming.', '{"Side A": ["Circles", "Complicated", "Blue World", "Good News", "I Can See", "Everybody", "Woods"], "Side B": ["Hand Me Downs", "That''s On Me", "Hands", "Surf", "Once A Day"]}'),
('Discovery', 'Daft Punk', 780, 2001, 'LP', 'disponible', 'https://m.media-amazon.com/images/I/71bsHTr6idL._UF1000,1000_QL80_.jpg', 'El segundo álbum del dúo, un tributo nostálgico al pop, disco y R&B de su juventud.', '{"Side A": ["One More Time", "Aerodynamic", "Digital Love", "Harder, Better, Faster, Stronger"], "Side B": ["Crescendolls", "Nightvision", "Superheroes", "High Life", "Something About Us", "Voyager", "Veridis Quo", "Short Circuit", "Face to Face", "Too Long"]}');

-- 4. Habilitar RLS estricto en Profiles (Hardening de Auditoría)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Los usuarios solo pueden actualizar su propio perfil y NO pueden modificar su rol
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (
      SELECT role
      FROM profiles
      WHERE id = auth.uid()
    )
  );

-- (Removido: La política de "Admins can view all profiles" causaba un bucle infinito de recursión en RLS. No se necesita porque no hay vista de lista de usuarios.)
