require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const pool = require('./pool');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    /* ── Admin user ── */
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const hash = await bcrypt.hash(password, 12);
    await pool.query(`INSERT OR IGNORE INTO admin_users (username, password) VALUES (?, ?)`, [username, hash]);
    console.log(`Admin user "${username}" ready.`);

    /* ── Members ── */
    const members = [
      { name: 'Miia Uibo',           age: 23, role_et: 'Esimees',  role_en: 'Chair',  photo: 'profiles/MiiaUibo.jpg',         link: '#' },
      { name: 'Arhe Kala',           age: 23, role_et: 'Liige',    role_en: 'Member', photo: null,                            link: '#' },
      { name: 'Kaarel Leetsaar',     age: 17, role_et: 'Liige',    role_en: 'Member', photo: 'profiles/KaarelLeetsaar.png',   link: 'https://foxsigaming.github.io/portfolio/' },
      { name: 'Viktoria Kivirand',   age: 18, role_et: 'Liige',    role_en: 'Member', photo: 'profiles/ViktoriaKivirand.jpg', link: '#' },
      { name: 'Mart Robert Stümper', age: 18, role_et: 'Liige',    role_en: 'Member', photo: null,                            link: '#' },
      { name: 'Kaire Muinasmaa',     age: 18, role_et: 'Liige',    role_en: 'Member', photo: 'profiles/KaireMuinasmaa.jpg',   link: '#' },
      { name: 'Marie Gordeeva',      age: 17, role_et: 'Liige',    role_en: 'Member', photo: null,                            link: '#' },
      { name: 'Reelika Punkar',      age: 24, role_et: 'Liige',    role_en: 'Member', photo: null,                            link: '#' },
    ];
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      await pool.query(
        `INSERT INTO members (name, age, role_et, role_en, photo, link, sort_order)
         VALUES (?,?,?,?,?,?,?)`,
        [m.name, m.age, m.role_et, m.role_en, m.photo, m.link, i]
      );
    }
    console.log(`${members.length} members seeded.`);

    /* ── Projects ── */
    const projects = [
      { icon: '🎯', title_et: 'Noortefoorum',        title_en: 'Youth Forum',          desc_et: 'Iga-aastane foorum, kus noored arutavad olulisi teemasid ja teevad ettepanekuid kohalikele otsustajatele.', desc_en: 'Annual forum where young people discuss important topics and make proposals to local decision-makers.', tag_et: 'Üritus', tag_en: 'Event' },
      { icon: '🌿', title_et: 'Roheline Tartumaa',    title_en: 'Green Tartumaa',       desc_et: 'Keskkonnateadlikkuse projekt: koristustalgud, istutamistalgud ja hariduslikud üritused koolides.', desc_en: 'Environmental awareness project: clean-up campaigns, planting events, and educational activities in schools.', tag_et: 'Keskkond', tag_en: 'Environment' },
      { icon: '💡', title_et: 'Noored Ettevõtjad',    title_en: 'Young Entrepreneurs',  desc_et: 'Programm, mis aitab noortel arendada ettevõtlusoskusi mentorluse, töötubade ja äriplaanikontestide kaudu.', desc_en: 'A program helping youth develop entrepreneurial skills through mentoring, workshops, and business plan competitions.', tag_et: 'Haridus', tag_en: 'Education' },
      { icon: '🤝', title_et: 'Vabatahtlik Tartumaa', title_en: 'Volunteer Tartumaa',   desc_et: 'Vabatahtliku töö populariseerimise projekt, mis ühendab noori vabatahtlikke organisatsioonide ja kogukondadega.', desc_en: 'A volunteer promotion program that connects young volunteers with organisations and communities.', tag_et: 'Kogukond', tag_en: 'Community' },
      { icon: '🎭', title_et: 'Kultuurikuu',          title_en: 'Culture Month',        desc_et: 'Igakuised kultuuriüritused, mis toovad kokku noored loojad, artistid ja kultuurihuvilised üle Tartumaa.', desc_en: 'Monthly cultural events bringing together young creators, artists, and culture enthusiasts across Tartumaa.', tag_et: 'Kultuur', tag_en: 'Culture' },
      { icon: '🏆', title_et: 'Noorte Sport',         title_en: 'Youth Sports',         desc_et: 'Sportlike tegevuste korraldamine tervisliku eluviisi ja meeskonnatöö edendamiseks noorte seas.', desc_en: 'Organising sports activities to promote healthy lifestyles and teamwork skills among youth.', tag_et: 'Sport', tag_en: 'Sports' },
    ];
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      await pool.query(
        `INSERT INTO projects (icon, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order)
         VALUES (?,?,?,?,?,?,?,?)`,
        [p.icon, p.title_et, p.title_en, p.desc_et, p.desc_en, p.tag_et, p.tag_en, i]
      );
    }
    console.log(`${projects.length} projects seeded.`);

    /* ── Gallery ── */
    const gallery = [
      { emoji: '🎯', gradient: 'var(--grad-icon-1)', title_et: 'Noortefoorum 2025',                title_en: 'Youth Forum 2025',          desc_et: 'Tartumaa noored arutamas tuleviku üle',        desc_en: 'Tartumaa youth discussing the future',           tag_et: 'Üritus',   tag_en: 'Event' },
      { emoji: '🌿', gradient: 'var(--grad-icon-2)', title_et: 'Roheline Tartumaa koristustalgu',   title_en: 'Green Tartumaa Clean-up',   desc_et: 'Vabatahtlikud puhastamas Emajõe kallast',      desc_en: 'Volunteers cleaning the Emajõgi riverbank',     tag_et: 'Keskkond', tag_en: 'Environment' },
      { emoji: '💡', gradient: 'linear-gradient(135deg, #F5A623, #22A86A)', title_et: 'Ettevõtluspäev', title_en: 'Entrepreneurship Day', desc_et: 'Noored ettevõtjad esitlemas oma äriideid', desc_en: 'Young entrepreneurs pitching their business ideas', tag_et: 'Haridus', tag_en: 'Education' },
      { emoji: '🤝', gradient: 'var(--grad-icon-4)', title_et: 'Vabatahtlike päev',                 title_en: 'Volunteer Day',             desc_et: 'Kogukonna ühistegevus Tartumaal',              desc_en: 'Community activities across Tartumaa',            tag_et: 'Kogukond', tag_en: 'Community' },
      { emoji: '🎭', gradient: 'var(--grad-icon-5)', title_et: 'Kultuurikuu gala',                  title_en: 'Culture Month Gala',        desc_et: 'Noored loojad laval',                          desc_en: 'Young creators on stage',                         tag_et: 'Kultuur',  tag_en: 'Culture' },
      { emoji: '🏆', gradient: 'var(--grad-icon-6)', title_et: 'Sportlik väljakutse',               title_en: 'Sports Challenge',          desc_et: 'Meeskonnatöö ja tervislik eluviis',            desc_en: 'Teamwork and healthy living',                     tag_et: 'Sport',    tag_en: 'Sports' },
    ];
    for (let i = 0; i < gallery.length; i++) {
      const g = gallery[i];
      await pool.query(
        `INSERT INTO gallery (emoji, gradient, title_et, title_en, desc_et, desc_en, tag_et, tag_en, sort_order)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [g.emoji, g.gradient, g.title_et, g.title_en, g.desc_et, g.desc_en, g.tag_et, g.tag_en, i]
      );
    }
    console.log(`${gallery.length} gallery items seeded.`);

    /* ── Events ── */
    const events = [
      { date: '2026-06-15', title_et: 'Noortefoorum 2026',        title_en: 'Youth Forum 2026',                desc_et: 'Iga-aastane foorum Tartu Ülikooli peahoones, kus noored arutavad hariduse ja keskkonna teemasid.', desc_en: 'Annual forum at the University of Tartu main building where youth discuss education and environmental topics.', tag_et: 'Üritus', tag_en: 'Event', loc_et: 'Tartu Ülikool', loc_en: 'University of Tartu', time: '10:00–16:00' },
      { date: '2026-06-28', title_et: 'Suvine koristustalgu',     title_en: 'Summer Clean-up Day',             desc_et: 'Liituge meiega Emajõe äärsete alade puhastamisel ja puude istutamisel.', desc_en: 'Join us in cleaning up areas along the Emajõgi river and planting trees.', tag_et: 'Keskkond', tag_en: 'Environment', loc_et: 'Emajõe kaldapealne', loc_en: 'Emajõgi Riverbank', time: '09:00–13:00' },
      { date: '2026-07-12', title_et: 'Ettevõtluse suvelaager',   title_en: 'Entrepreneurship Summer Camp',    desc_et: 'Kolmepäevane laager noortele, kes soovivad arendada ettevõtlusoskusi ja luua oma äriplaane.', desc_en: 'A three-day camp for young people who want to develop entrepreneurial skills and create their own business plans.', tag_et: 'Haridus', tag_en: 'Education', loc_et: 'Tartumaa Noortekeskus', loc_en: 'Tartumaa Youth Centre', time: '12.–14. juuli' },
      { date: '2026-08-08', title_et: 'Noorte spordipäev',        title_en: 'Youth Sports Day',                desc_et: 'Sportlikud võistlused ja meeskonnamängud Tartumaa noortele — tule ja proovi erinevaid spordialasid!', desc_en: 'Sports competitions and team games for Tartumaa youth — come try different sports!', tag_et: 'Sport', tag_en: 'Sports', loc_et: 'Tartu Spordihall', loc_en: 'Tartu Sports Hall', time: '11:00–17:00' },
    ];
    for (const e of events) {
      await pool.query(
        `INSERT INTO events (event_date, title_et, title_en, desc_et, desc_en, tag_et, tag_en, location_et, location_en, time_text)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [e.date, e.title_et, e.title_en, e.desc_et, e.desc_en, e.tag_et, e.tag_en, e.loc_et, e.loc_en, e.time]
      );
    }
    console.log(`${events.length} events seeded.`);

    /* ── Site settings ── */
    const settings = [
      { key: 'hero_title',    et: 'Tartumaa Noortekogu', en: 'Tartumaa Youth Council' },
      { key: 'hero_subtitle', et: 'Tartumaa noorte hääl ja esindus', en: "The voice and representation of Tartumaa's youth" },
      { key: 'hero_desc',     et: 'Me esindame Tartumaa noori, korraldame üritusi, viime ellu projekte ja osaleme otsuste tegemisel, mis kujundavad meie noorte tulevikku.', en: "We represent the youth of Tartumaa, organise events, implement projects, and participate in decisions that shape our young people's future." },
      { key: 'about_text_1',  et: 'Tartumaa Noortekogu on noorte organisatsioon, mis esindab Tartumaa noorte huve ja vajadusi. Meie missioon on kaasata noori ühiskondlikesse protsessidesse, toetada nende arengut ning luua võimalusi eneseväljenduseks ja koostööks.', en: 'Tartumaa Noortekogu is a youth organisation representing the interests and needs of young people in Tartumaa. Our mission is to engage youth in social processes, support their development, and create opportunities for self-expression and collaboration.' },
      { key: 'about_text_2',  et: 'Oleme asutatud 2018. aastal ja alates sellest ajast kasvanud aktiivseks organisatsiooniks, kellel on üle 8 liikme erinevatest Tartumaa omavalitsustest.', en: 'Founded in 2018, we have grown into an active organisation with over 8 members from various municipalities across Tartumaa.' },
      { key: 'contact_email', et: 'info@tartumaa-noortekogu.ee', en: 'info@tartumaa-noortekogu.ee' },
      { key: 'contact_location', et: 'Tartu, Tartumaa, Eesti', en: 'Tartu, Tartumaa, Estonia' },
      { key: 'stat_members',  et: '8',   en: '8' },
      { key: 'stat_projects', et: '10',  en: '10' },
      { key: 'stat_years',    et: '2',   en: '2' },
      { key: 'stat_youth',    et: '500', en: '500' },
    ];
    for (const s of settings) {
      await pool.query(
        `INSERT INTO site_settings (key, value_et, value_en) VALUES (?,?,?)
         ON CONFLICT(key) DO UPDATE SET value_et=excluded.value_et, value_en=excluded.value_en, updated_at=CURRENT_TIMESTAMP`,
        [s.key, s.et, s.en]
      );
    }
    console.log(`${settings.length} site settings seeded.`);

    console.log('\nSeed complete!');
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await pool.end();
  }
}

seed();
