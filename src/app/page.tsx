import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex-center" style={{ minHeight: "80vh" }}>
      <div className="card text-center fade-in" style={{ maxWidth: 600 }}>
        <h1 className="text-primary mb-4" style={{ fontSize: 40 }}>Welcome to Secretariat</h1>
        <p className="text-secondary mb-4 text-lg">
          Transform your board evaluation process with our secure digital solution.
          Efficiently manage peer-to-peer reviews and assessment questionnaires.
        </p>
        <div className="flex-center gap-4 mt-4">
          <Link className="button primary hover-scale" href="/dashboard">
            Go to Dashboard
          </Link>
          <Link className="button hover-scale" href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
