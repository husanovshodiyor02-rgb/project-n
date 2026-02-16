import Link from 'next/link'


const Header = () => {
  return (
    <div className="flex items-center justify-center gap-5 p-4 bg-red-500">
      <Link href={"/"}>Home</Link>
      <Link href={"/about"}>About</Link>
      <Link href={"/contact"}>Contact</Link>
      <Link href={"/login"}>Login</Link>
    </div>
  );
}

export default Header