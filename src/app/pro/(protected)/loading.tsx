export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* On ne monte rien ici, on laisse le layout et la page gérer le squelette précis */}
            {/* Cette page blanche permet un First Paint immédiat pendant que le layout se charge */}
        </div>
    )
}
