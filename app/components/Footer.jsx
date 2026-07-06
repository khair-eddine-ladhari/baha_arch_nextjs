import Link from "next/link"; // replaces react-router-dom's Link
// No "use client" needed — no state, no hooks, no interactivity.

const Footer = () => {

  const LINK_CLS =
    "text-[0.65rem] uppercase tracking-widest font-bold text-black hover:opacity-40 transition-opacity duration-[250ms]";

  return (
     <footer className="border-t border-black px-8 py-2">
        <div className="flex flex-wrap justify-between items-center gap-4 ">
          <li className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600 ">
              developed by KHAIR EDDINE LADHARI
            </li>
          <ul className="flex flex-wrap gap-6 items-center">
            {["Contact"].map((item) => (
              <li key={item}>
                <Link href={`/${item.toLowerCase()}`} className={LINK_CLS}>
                  {item}
                </Link>
              </li>
            ))}
              
            
            <li className="text-[0.65rem] uppercase tracking-widest font-bold text-gray-600">
              © Baha Architecture
            </li>
          </ul>
        </div>
      </footer>
  );
};

export default Footer;