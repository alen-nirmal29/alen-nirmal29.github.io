"use client"

import { PomodoroTimer } from "@/components/pomodoro-timer"

export function Dashboard() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
      <PomodoroTimer />
    </div>
  )
} 