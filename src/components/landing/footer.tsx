import Link from "next/link"
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 active:scale-95 transition-transform duration-100 touch-manipulation">
              <Image
                src="/logo.svg"
                alt="Serenio"
                width={32}
                height={32}
                className="brightness-0 invert"
              />
              <span className="font-bold text-xl text-white">Serenio</span>
            </Link>
            <p className="text-slate-400 leading-relaxed mb-6 max-w-sm">
              Le serrurier de confiance à Lyon. Prix transparents, artisans vérifiés, intervention rapide.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>Lyon et agglomération</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Disponible 24h/24, 7j/7</span>
              </div>
              <a href="mailto:contact@serenio.fr" className="flex items-center gap-2 text-sm hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>contact@serenio.fr</span>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/urgence" className="hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200 inline-block">
                  Urgence serrurier
                </Link>
              </li>
              <li>
                <Link href="/rdv" className="hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200 inline-block">
                  Prendre rendez-vous
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200 inline-block">
                  Porte claquée
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200 inline-block">
                  Changement de serrure
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Informations</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/pro/register" className="hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200 inline-block">
                  Devenir artisan partenaire
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200 inline-block">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200 inline-block">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white active:text-white active:scale-95 touch-manipulation transition-all duration-200 inline-block">
                  CGU
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Serenio. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
