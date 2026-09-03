import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"
import { TopBar } from "./TopBar"

export function AppLayout() {
  return (
    <div className="min-h-full">
      <TopBar />
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-4 sm:pb-8">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
