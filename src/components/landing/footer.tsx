import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="px-4 py-8 border-t border-border">
      <div className="max-w-lg mx-auto">
        <div className="text-center space-y-4">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/logo.svg"
              alt="Serenio"
              width={28}
              height={28}
            />
            <span className="font-bold text-lg">Serenio</span>
          </div>
          
          {/* Tagline */}
          <p className="text-xs text-muted-foreground">
            Le serrurier de confiance à Lyon
          </p>

          {/* Liens */}
          <div className="flex justify-center gap-6 text-xs">
            <Link
              href="/urgence"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Urgence
            </Link>
            <a
              href="mailto:contact@serenio.fr"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Mentions légales
            </Link>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground pt-4">
            © {new Date().getFullYear()} Serenio. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
