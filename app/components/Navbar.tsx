import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/prompts", label: "Prompts" },
  { href: "/experiments", label: "Experiments" },
  { href: "/results", label: "Results" },
];

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight hover:text-gray-300 transition-colors"
          >
            LLM Eval Harness
          </Link>
          <div className="flex items-center gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
