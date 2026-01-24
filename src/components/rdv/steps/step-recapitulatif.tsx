"use client"

import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Wrench,
  CreditCard,
  Edit2,
  CheckCircle2,
  Shield,
  Phone,
  Mail,
  FileText,
  Lock,
  Award,
  Undo2,
  AlertCircle,
  ListChecks,
  Info,
  Save,
  X,
  Wallet,
  Truck,
  Hammer,
  Search,
  Package,
  Timer
} from "lucide-react"
import type { RdvFormState, RdvServiceTypeDisplay } from "@/types/rdv"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface StepRecapitulatifProps {
  formState: RdvFormState
  serviceType: RdvServiceTypeDisplay
  onEdit: (stepIndex: number) => void
  onUpdate: (data: Partial<RdvFormState>) => void
}

export function StepRecapitulatif({ formState, serviceType, onEdit, onUpdate }: StepRecapitulatifProps) {
  const [isEditingContact, setIsEditingContact] = useState(false)
  const [editForm, setEditForm] = useState({
    firstName: formState.clientFirstName,
    lastName: formState.clientLastName,
    phone: formState.clientPhone,
    email: formState.clientEmail
  })

  const handleSaveContact = () => {
    onUpdate({
      clientFirstName: editForm.firstName,
      clientLastName: editForm.lastName,
      clientPhone: editForm.phone,
      clientEmail: editForm.email
    })
    setIsEditingContact(false)
  }

  const handleCancelContact = () => {
    setEditForm({
      firstName: formState.clientFirstName,
      lastName: formState.clientLastName,
      phone: formState.clientPhone,
      email: formState.clientEmail
    })
    setIsEditingContact(false)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  const formatTime = (start: string, end: string) => {
    return `${start?.replace(":", "h")} - ${end?.replace(":", "h")}`
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Titre */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Récapitulatif
        </h1>
        <p className="text-gray-500 max-w-md mx-auto">
          Vérifiez les informations ci-dessous avant de valider votre demande d'intervention.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 items-stretch">
        {/* Colonne Gauche : Détails techniques */}
        <div className="flex flex-col h-full gap-4 lg:gap-6">

          {/* Section Détails de l'intervention */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300 flex-1 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-600" />
                Détails de l'intervention
              </h3>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Service */}
              <div className="flex items-start justify-between group/item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Prestation</p>
                    <p className="font-semibold text-gray-900">{serviceType.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{serviceType.description}</p>
                  </div>
                </div>
                <button onClick={() => onEdit(0)} className="text-gray-400 hover:text-emerald-600 transition-colors p-2 hover:bg-emerald-50 rounded-full">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Date */}
              <div className="flex items-start justify-between group/item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Date et Heure</p>
                    <p className="font-semibold text-gray-900 capitalized">
                      {formState.selectedDate ? formatDate(formState.selectedDate) : "Non défini"}
                    </p>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formState.selectedTimeStart && formState.selectedTimeEnd
                        ? formatTime(formState.selectedTimeStart, formState.selectedTimeEnd)
                        : "Non défini"
                      }
                    </div>
                  </div>
                </div>
                <button onClick={() => onEdit(4)} className="text-gray-400 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-full">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="h-px bg-gray-100 w-full" />

              {/* Adresse */}
              <div className="flex items-start justify-between group/item">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider text-[10px]">Adresse</p>
                    <p className="font-semibold text-gray-900">{formState.addressStreet}</p>
                    <p className="text-sm text-gray-500">
                      {formState.addressPostalCode} {formState.addressCity}
                    </p>
                    {formState.addressComplement && (
                      <p className="text-xs text-gray-400 mt-1">{formState.addressComplement}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => onEdit(6)} className="text-gray-400 hover:text-amber-600 transition-colors p-2 hover:bg-amber-50 rounded-full">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>


        </div>

        {/* Colonne Droite : Infos & Prix (Juste le Hero) */}
        <div className="flex flex-col h-full gap-4 lg:gap-6">

          {/* Grouping Coord and Estimation to match height of Details card */}
          <div className="flex-1 flex flex-col gap-3 lg:gap-4">
            {/* Section Vos Coordonnées */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300 flex-shrink-0 flex flex-col">
              <div className="h-[52px] px-6 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Vos coordonnées
                </h3>
                <div className="flex items-center justify-end min-w-[64px] h-8">
                  {isEditingContact ? (
                    <div className="flex items-center gap-1 animate-in fade-in zoom-in-95 duration-200 h-full">
                      <button
                        onClick={handleCancelContact}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
                        title="Annuler"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSaveContact}
                        className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100/50 bg-white"
                        title="Enregistrer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingContact(true)}
                      className="h-8 px-2 text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                      <Edit2 className="w-3 h-3" />
                      Modifier
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 relative">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <User className="w-24 h-24" />
                </div>

                <div className="relative z-10 space-y-3">
                  {/* Avatar & Name - Always visible and constant */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm border border-emerald-100">
                      {formState.clientFirstName.charAt(0)}{formState.clientLastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{formState.clientFirstName} {formState.clientLastName}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Client</p>
                    </div>
                  </div>

                  {/* Contact Fields */}
                  <div className="space-y-2 pt-1">
                    {/* Phone */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100/50 flex-shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 h-8 flex items-center">
                        {isEditingContact ? (
                          <Input
                            value={editForm.phone}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="h-8 text-sm focus-visible:ring-emerald-500 border-emerald-100 bg-white -ml-2 px-2"
                            placeholder="Téléphone"
                            autoFocus
                          />
                        ) : (
                          <p className="text-sm text-gray-700 font-medium">
                            {formState.clientPhone.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1 ')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100/50 flex-shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 h-8 flex items-center">
                        {isEditingContact ? (
                          <Input
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="h-8 text-sm focus-visible:ring-emerald-500 border-emerald-100 bg-white -ml-2 px-2"
                            placeholder="Email"
                          />
                        ) : (
                          <p className="text-sm text-gray-700 font-medium">{formState.clientEmail}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Prix Hero */}
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[160px] flex-shrink-0 flex-1 group hover:shadow-xl transition-shadow duration-300">
              {/* Background Decor */}
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <CreditCard className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 shadow-sm">
                  <Wallet className="w-5 h-5 text-emerald-50" />
                </div>
                <h3 className="font-semibold text-lg text-white tracking-wide">Estimation tarifaire</h3>
              </div>

              {/* Price Content */}
              <div className="relative z-10 mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl lg:text-5xl font-bold tracking-tight">
                    {formState.estimatedPriceMin}-{formState.estimatedPriceMax}€
                  </span>
                  <span className="text-emerald-100 text-lg font-medium opacity-80">TTC</span>
                </div>
                <p className="text-emerald-100/60 text-xs mt-1 font-medium tracking-wide uppercase">Main d'œuvre et déplacement inclus</p>
              </div>
            </div>
          </div>


        </div>
      </div>

      {/* DÉTAILS DU PRIX (Middle Row - Full Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Ce qui est inclus */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-gray-900">Ce qui est inclus</h4>
          </div>

          <div className="p-6 space-y-4">
            {/* Déplacement */}
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Déplacement du professionnel</p>
                <p className="text-xs text-gray-500">Rayon d'intervention couvert</p>
              </div>
            </div>

            {/* Main d'oeuvre */}
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Hammer className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Main d'œuvre</p>
                <p className="text-xs text-gray-500">Qualification certifiée</p>
              </div>
            </div>

            {/* Diagnostic */}
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Diagnostic sur place</p>
                <p className="text-xs text-gray-500">Analyse complète</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ce qui peut faire varier le prix */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h4 className="font-semibold text-gray-900">Ce qui peut faire varier le prix</h4>
          </div>

          <div className="p-6 space-y-4">
            {/* Facteur Variable */}
            <div className="flex items-center gap-4 group opacity-50 grayscale">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-200">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Aucun facteur variable détecté</p>
                <p className="text-xs text-gray-500">Basé sur vos réponses</p>
              </div>
            </div>

            {/* Pièces */}
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Pièces et matériel nécessaires</p>
                <p className="text-xs text-gray-500">Si remplacement requis</p>
              </div>
            </div>

            {/* Complexité */}
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:scale-105 transition-transform">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Complexité constatée sur place</p>
                <p className="text-xs text-gray-500">Temps d'intervention additionnel</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conditions */}
      <p className="text-xs text-center text-gray-400 mt-8">
        En confirmant, vous acceptez nos{" "}
        <a href="/cgu" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">conditions générales</a>
        {" "}et notre{" "}
        <a href="/politique-de-confidentialite" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">politique de confidentialité</a>
      </p>
    </div>
  )
}
