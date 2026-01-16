"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export function RealtimeMonitor({ trackingNumber }: { trackingNumber: string | null }) {
    const [logs, setLogs] = useState<string[]>([])
    const [status, setStatus] = useState("DISCONNECTED")

    const addLog = (msg: string) => {
        setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev])
    }

    useEffect(() => {
        if (!trackingNumber) return

        addLog(`Initializing channel for tracking #${trackingNumber}`)

        const channel = supabase.channel(`debug-${trackingNumber}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'intervention_requests' },
                (payload) => {
                    addLog(`EVENT RECEIVED: ${payload.eventType}`)
                    addLog(`Payload: ${JSON.stringify(payload)}`)
                }
            )
            .subscribe((status) => {
                setStatus(status)
                addLog(`Channel Status: ${status}`)
            })

        return () => {
            addLog("Cleaning up channel")
            supabase.removeChannel(channel)
        }
    }, [trackingNumber])

    if (!trackingNumber) return null

    return (
        <div className="fixed bottom-4 right-4 w-96 h-64 bg-black/90 text-green-400 p-4 rounded-lg font-mono text-xs z-50 shadow-2xl border border-green-500/20">
            <div className="flex justify-between items-center mb-2 border-b border-green-500/20 pb-2">
                <span className="font-bold">Realtime Debugger</span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${status === 'SUBSCRIBED' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {status}
                </span>
            </div>
            <div className="h-[calc(100%-2rem)] overflow-y-auto font-mono">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 break-all whitespace-pre-wrap text-[10px]">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    )
}
