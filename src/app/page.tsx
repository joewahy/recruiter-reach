import { demoPeople } from "@/features/contacts/demo-people";
import { FinderSearch } from "@/features/finder/finder-search";

export default function HomePage() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/">Recruiter Reach<span className="brand-dot">.</span></a>
        <span className="badge">WORK EMAIL FINDER</span>
      </header>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h1 id="page-title">A good conversation<br />starts with the right person.</h1>
        <p className="description">Know who you want to reach? Enter their name and company website to look for a work email.</p>
      </section>
      <FinderSearch />
      <section aria-labelledby="directory-title">
        <div className="section-heading"><h2 id="directory-title">Meet the demo directory</h2><span>DEMO · {demoPeople.length} fictional profiles</span></div>
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
        <p>The search above uses the email finder. These example profiles are synthetic and separate from your results. The repository’s docs cover a beginner working method and debugging exercises.</p>
      </aside>
      <footer>Local email finder. No email sending, accounts, or saved searches.</footer>
    </main>
  );
}
