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
  FileText,
  Lock,
  Award,
  Undo2,
  AlertCircle,
  ListChecks,
  Info,
  Save,
  X
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
        <div className="space-y-4 lg:space-y-6 flex flex-col h-full">

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

          {/* Section Artisan */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between group hover:border-purple-100 transition-colors mt-auto flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 text-purple-600 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Artisan</p>
                <p className="text-sm text-gray-500">Attribution automatique</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full uppercase tracking-wide border border-purple-100">
                Confirmé
              </span>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Infos & Prix (Juste le Hero) */}
        <div className="space-y-4 lg:space-y-6 flex flex-col h-full">

          {/* Section Vos Infos */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <User className="w-24 h-24" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <h3 className="font-semibold text-gray-900">Vos coordonnées</h3>
              {!isEditingContact && (
                <button
                  onClick={() => setIsEditingContact(true)}
                  className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  Modifier
                </button>
              )}
            </div>

            <div className="relative z-10">
              {isEditingContact ? (
                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  {/* Static Header during edit */}
                  <div className="flex items-center gap-3 opacity-60 grayscale pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                      {formState.clientFirstName.charAt(0)}{formState.clientLastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formState.clientFirstName} {formState.clientLastName}</p>
                      <p className="text-xs text-gray-500">Client</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Téléphone</label>
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Email</label>
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                    <Button variant="ghost" size="sm" onClick={handleCancelContact} className="h-7 text-xs">
                      <X className="w-3 h-3 mr-1" />
                      Annuler
                    </Button>
                    <Button size="sm" onClick={handleSaveContact} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700">
                      <Save className="w-3 h-3 mr-1" />
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                      {formState.clientFirstName.charAt(0)}{formState.clientLastName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formState.clientFirstName} {formState.clientLastName}</p>
                      <p className="text-xs text-gray-500">Client</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {formState.clientPhone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 p-2 rounded-lg">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {formState.clientEmail}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section Prix Hero */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-center min-h-[160px] flex-shrink-0">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CreditCard className="w-32 h-32 transform rotate-12 translate-x-8 -translate-y-8" />
            </div>

            <p className="text-emerald-100 text-sm font-medium mb-1">Estimation tarifaire</p>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl lg:text-5xl font-bold tracking-tight">
                {formState.estimatedPriceMin}-{formState.estimatedPriceMax}€
              </span>
              <span className="text-emerald-200 text-sm">TTC</span>
            </div>
            {/* Disclaimer removed from here */}
          </div>

          <div className="flex-1"></div>

          {/* Section Confirmation Prix (Nouvelle position) */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-4 flex items-center justify-between group hover:border-emerald-200 transition-colors mt-auto flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 text-emerald-600 group-hover:scale-105 transition-transform">
                <Info className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Prix Final</p>
                <p className="text-sm text-gray-500">Confirmé sur place</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full uppercase tracking-wide border border-emerald-100">
                Garanti
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DÉTAILS DU PRIX (Middle Row - Full Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Ce qui est inclus */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-emerald-600" />
            Ce qui est inclus
          </h4>
          <ul className="space-y-3">
            {[
              "Déplacement du professionnel",
              "Main d'œuvre",
              "Diagnostic sur place"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-600 bg-emerald-50/50 p-2 rounded-lg border border-emerald-50">
                <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Ce qui peut faire varier le prix */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Ce qui peut faire varier le prix
          </h4>
          <ul className="space-y-3">
            {[
              "Aucun facteur variable détecté",
              "Pièces et matériel nécessaires",
              "Complexité constatée sur place"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-gray-600 bg-amber-50/30 p-2 rounded-lg border border-amber-50">
                <div className="w-2 h-2 rounded-full bg-amber-300 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
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
