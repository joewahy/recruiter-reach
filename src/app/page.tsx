import { demoPeople } from "@/features/contacts/demo-people";
import { AppHeader } from "@/components/app-header";
import { FinderSearch } from "@/features/finder/finder-search";

export default function HomePage() {
  return (
    <main>
      <AppHeader />
      <section className="home-intro" aria-labelledby="page-title">
        <span className="intro-pill">A simpler way to reach out</span>
        <h1 id="page-title">Find the right person.<br /><span>Start a conversation.</span></h1>
        <p>Look up a recruiter’s work email, write a thoughtful introduction, and take the next step in your job search.</p>
        <a className="intro-cta" href="#find-recruiter">Find a recruiter <span aria-hidden="true">↓</span></a>
      </section>
      <FinderSearch />
      <details className="demo-preview"><summary>Explore the demo directory <span>3 fictional profiles</span></summary>
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
      </details>
      <footer>Local email finder. No email sending, accounts, or saved searches.</footer>
    </main>
  );
}
