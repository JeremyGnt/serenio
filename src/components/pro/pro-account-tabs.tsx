"use client"

import { useState } from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { ProCompanySection } from "./pro-company-section"
import { ProContactSection } from "./pro-contact-section"
import { ProAddressSection } from "./pro-address-section"
import { ProPasswordSection } from "./pro-password-section"
import { ProBillingSection } from "./pro-billing-section"
import { ProDeleteSection } from "./pro-delete-section"
import { ProSettingsLayout } from "./pro-settings-layout"

interface ProAccountTabsProps {
  user: SupabaseUser
}

export function ProAccountTabs({ user }: ProAccountTabsProps) {
  const [activeTab, setActiveTab] = useState("company")

  return (
    <ProSettingsLayout user={user} activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="p-6 md:p-8">
        {activeTab === "company" && <ProCompanySection user={user} />}
        {activeTab === "contact" && <ProContactSection user={user} />}
        {activeTab === "address" && <ProAddressSection user={user} />}
        {activeTab === "password" && <ProPasswordSection />}
        {activeTab === "billing" && <ProBillingSection user={user} />}
        {activeTab === "delete" && <ProDeleteSection />}
      </div>
    </ProSettingsLayout>
  )
}

