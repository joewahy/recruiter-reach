import { demoPeople } from "@/features/contacts/demo-people";

export default function HomePage() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/">Recruiter Reach<span className="brand-dot">.</span></a>
        <span className="badge">DEMO · SYNTHETIC DATA</span>
      </header>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h1 id="page-title">A good conversation<br />starts with the right person.</h1>
        <p className="description">A starting point for finding recruiters and hiring managers. We’re building this one small milestone at a time.</p>
      </section>
      <section aria-labelledby="directory-title">
        <div className="section-heading"><h2 id="directory-title">Meet the demo directory</h2><span>{demoPeople.length} fictional profiles</span></div>
        <div className="people-grid">
          {demoPeople.map((person) => (
            <article className="person-card" key={person.id}>
              <div className="avatar" aria-hidden="true">{person.name.split(" ").map((part) => part[0]).join("")}</div>
              <p className="role-label">{person.role === "recruiter" ? "Recruiter" : "Hiring manager"}</p>
              <h3>{person.name}</h3>
              <p className="person-title">{person.title}</p>
              <p>{person.company}</p>
              <p className="location">{person.location}</p>
              <p className="demo-note">Invented profile · no contact lookup connected</p>
            </article>
          ))}
        </div>
      </section>
      <aside className="next-step" aria-labelledby="next-title">
        <div><p className="eyebrow">BUILD TOGETHER</p><h2 id="next-title">Small steps. Shared ownership.</h2></div>
        <p>Next up: turn this directory into a searchable experience. The repository’s learning plan contains six milestones, owner suggestions, and debugging exercises.</p>
      </aside>
      <footer>Starter only. No email discovery, sending, account system, or saved data yet.</footer>
    </main>
  );
}
