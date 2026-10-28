import { demoPeople } from "@/features/contacts/demo-people";
import { FinderSearch } from "@/features/finder/finder-search";

export default function HomePage() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="/"><span className="brand-icon" aria-hidden="true">r</span>Recruiter Reach<span className="brand-dot">.</span></a>
        <span className="badge">YOUR JOB SEARCH, CONNECTED</span>
      </header>
      <div className="search-workspace"><section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">MAKE YOUR NEXT MOVE</p>
        <h1 id="page-title">The right person.<br /><span className="headline-accent">Your next opportunity.</span></h1>
        <p className="description">Turn a name into a new conversation. Find work emails for recruiters and hiring managers at the companies you want to join.</p>
        <div className="intro-guide"><span className="guide-icon" aria-hidden="true">↗</span><div><strong>A little context goes a long way.</strong><p>Start with their name and company. Review the result before planning your outreach.</p></div></div>
      </section>
      <FinderSearch /></div>
      <section aria-labelledby="directory-title">
        <div className="section-heading"><h2 id="directory-title">A preview of your next connections</h2><span>DEMO · {demoPeople.length} fictional profiles</span></div>
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
        <div><p className="eyebrow">ONE STEP AT A TIME</p><h2 id="next-title">Small steps. Shared ownership.</h2></div>
        <p>The search above uses the email finder. These example profiles are synthetic and separate from your results. The repository’s docs cover a beginner working method and debugging exercises.</p>
      </aside>
      <footer>Local email finder. No email sending, accounts, or saved searches.</footer>
    </main>
  );
}
