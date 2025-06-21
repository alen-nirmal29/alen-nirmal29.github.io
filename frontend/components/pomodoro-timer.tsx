"use client"

import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Coffee, Target, Info, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createPomodoroSession } from "@/utils/pomodoro-api"

interface PomodoroTimerProps {
  onTimeUpdate?: (seconds: number) => void
  onComplete?: (task: string, duration: number) => void
}

export function PomodoroTimer({ onTimeUpdate, onComplete }: PomodoroTimerProps) {
  const [customWorkTime, setCustomWorkTime] = useState(25) // minutes
  const [customShortBreak, setCustomShortBreak] = useState(5) // minutes
  const [customLongBreak, setCustomLongBreak] = useState(15) // minutes
  const [showSettings, setShowSettings] = useState(false)

  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(customWorkTime * 60) // 25 minutes in seconds
  const [currentSession, setCurrentSession] = useState<"work" | "break">("work")
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const [currentTask, setCurrentTask] = useState("")
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)

  const WORK_TIME = customWorkTime * 60 // convert to seconds
  const SHORT_BREAK = customShortBreak * 60
  const LONG_BREAK = customLongBreak * 60

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
  console.log("Interval tick, prev timeLeft =", prev);
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  useEffect(() => {
    console.log("[PomodoroTimer useEffect] timeLeft:", timeLeft, ", currentSession:", currentSession, ", currentTask:", currentTask, ", isRunning:", isRunning, ", sessionStartTime:", sessionStartTime, ", completedPomodoros:", completedPomodoros, ", WORK_TIME:", WORK_TIME, ", SHORT_BREAK:", SHORT_BREAK, ", LONG_BREAK:", LONG_BREAK);
    if (timeLeft === 0) {
      if (currentSession === "work" && currentTask.trim() && onComplete) {
        // Save Pomodoro session to backend
        const now = new Date();
        const start = sessionStartTime ? sessionStartTime : new Date(now.getTime() - WORK_TIME * 1000);
        createPomodoroSession({
          start_time: start.toISOString(),
          end_time: now.toISOString(),
          duration: Math.round(WORK_TIME / 60),
          break_duration: completedPomodoros % 4 === 3 ? customLongBreak : customShortBreak,
          cycles: 1,
          notes: currentTask,
        })
        .then(() => {
          alert("Pomodoro session auto-saved!");
          console.log("Pomodoro POST auto-save fired");
        })
        .catch((e) => {
          alert("Auto-save failed: " + e.message);
          console.error("Auto-save error:", e);
        });
        console.log("[PomodoroTimer] onComplete fired", currentTask, WORK_TIME);
        onComplete(currentTask, WORK_TIME);
      }
      if (currentSession === "work") {
        setCompletedPomodoros((prev) => prev + 1);
        const newCompletedCount = completedPomodoros + 1;
        if (newCompletedCount % 4 === 0) {
          setTimeLeft(LONG_BREAK);
        } else {
          setTimeLeft(SHORT_BREAK);
        }
        setCurrentSession("break");
        setIsRunning(true); // Auto-start break
      } else {
        setTimeLeft(WORK_TIME);
        setCurrentSession("work");
        setCurrentTask("");
        setIsRunning(false); // Wait for user to start work
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  // Separate useEffect to handle onTimeUpdate callback
  useEffect(() => {
    if (onTimeUpdate && currentSession === "work" && isRunning) {
      onTimeUpdate(WORK_TIME - timeLeft)
    }
  }, [timeLeft, onTimeUpdate, currentSession, isRunning, WORK_TIME])

  // Only update timer when custom settings actually change, not on every session switch
  useEffect(() => {
    if (!isRunning) {
      if (currentSession === "work") {
        setTimeLeft(WORK_TIME)
      } else {
        const isLongBreak = completedPomodoros % 4 === 0 && completedPomodoros > 0
        setTimeLeft(isLongBreak ? LONG_BREAK : SHORT_BREAK)
      }
    }
    // Only run when custom settings change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [WORK_TIME, SHORT_BREAK, LONG_BREAK])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = currentSession === "work" ? WORK_TIME : completedPomodoros % 4 === 3 ? LONG_BREAK : SHORT_BREAK
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const handleStartPause = () => {
    if (currentSession === "work" && !currentTask.trim() && !isRunning) {
      return; // Don't start without a task
    }
    
    if (!isRunning) {
      setSessionStartTime(new Date());
  }
    
    setIsRunning((prev) => !prev);
  };

  const handleReset = () => {
    setIsRunning(false)
    setTimeLeft(
      currentSession === "work"
        ? WORK_TIME
        : completedPomodoros % 4 === 0 && completedPomodoros > 0
          ? LONG_BREAK
          : SHORT_BREAK,
    )
    if (onTimeUpdate) {
      onTimeUpdate(0)
    }
  }

  const handleSkipSession = () => {
    if (currentSession === "work") {
      // Skip to break
      const newCompletedCount = completedPomodoros + 1;
      setCompletedPomodoros(newCompletedCount);
      if (newCompletedCount % 4 === 0) {
        setTimeLeft(LONG_BREAK);
      } else {
        setTimeLeft(SHORT_BREAK);
      }
      setCurrentSession("break");
      setIsRunning(true); // Auto-start break
    } else {
      // Skip to work
      setTimeLeft(WORK_TIME);
      setCurrentSession("work");
      setCurrentTask("");
      setIsRunning(false); // Wait for user to start work
    }
  };

  return (
    <div className="space-y-6">
      {showSettings && (
        <Card className="border-blue-200 bg-blue-50 mb-4">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-700">
              <Settings className="h-5 w-5 mr-2" />
              Timer Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="workTime">Focus Time (minutes)</Label>
                <Input
                  id="workTime"
                  type="number"
                  min="1"
                  max="60"
                  value={customWorkTime}
                  onChange={(e) => setCustomWorkTime(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                <Input
                  id="shortBreak"
                  type="number"
                  min="1"
                  max="30"
                  value={customShortBreak}
                  onChange={(e) => setCustomShortBreak(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="longBreak">Long Break (minutes)</Label>
                <Input
                  id="longBreak"
                  type="number"
                  min="1"
                  max="60"
                  value={customLongBreak}
                  onChange={(e) => setCustomLongBreak(Number(e.target.value))}
                />
              </div>
            </div>
            <Button
              onClick={() => {
                setShowSettings(false)
                // Always reset to focus session when saving settings
                setCurrentSession("work");
                setTimeLeft(customWorkTime * 60);
                setIsRunning(false);
                setCurrentTask("");
                setCompletedPomodoros(0);
              }}
              className="w-full"
            >
              Save Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pomodoro Info Card */}
      {showInfo && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-700">
              <Info className="h-5 w-5 mr-2" />
              The Pomodoro Technique
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-purple-600 space-y-2">
            <p>
              The Pomodoro Technique is a time management method that utilizes short, focused work intervals (typically
              25 minutes) followed by short breaks to improve focus and productivity.
            </p>
            <div className="space-y-6">
              {/* DEBUG: Manual Pomodoro POST button */}
              <Button onClick={() => {
                createPomodoroSession({
                  start_time: new Date().toISOString(),
                  end_time: new Date().toISOString(),
                  duration: 25,
                  break_duration: 5,
                  cycles: 1,
                  notes: "Manual test"
                }).then(() => alert("POST sent! Check backend logs."))
                  .catch((e) => alert("POST failed: " + e.message));
              }}>
                Test Save Pomodoro
              </Button>
              <p>
                <strong>How it works:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Work for 25 minutes (1 Pomodoro)</li>
                <li>Take a 5-minute break</li>
                <li>After 4 Pomodoros, take a longer 15-minute break</li>
                <li>Repeat the cycle</li>
              </ul>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInfo(false)}
              className="text-purple-600 hover:text-purple-700"
            >
              Got it!
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Task Input for Work Sessions */}
      {currentSession === "work" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">What will you work on?</label>
          <Input
            placeholder="Enter your task for this Pomodoro session..."
            value={currentTask}
            onChange={(e) => setCurrentTask(e.target.value)}
            className="text-lg"
            disabled={isRunning}
          />
        </div>
      )}

      {/* Timer Display */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Badge
            variant={currentSession === "work" ? "default" : "secondary"}
            className={`px-3 py-1 ${
              currentSession === "work"
                ? "bg-red-100 text-red-700 border-red-200"
                : "bg-green-100 text-green-700 border-green-200"
            }`}
          >
            {currentSession === "work" ? (
              <>
                <Target className="h-4 w-4 mr-1" />
                Focus Time ({customWorkTime}m)
              </>
            ) : (
              <>
                <Coffee className="h-4 w-4 mr-1" />
                Break Time ({completedPomodoros % 4 === 3 ? customLongBreak : customShortBreak}m)
              </>
            )}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-blue-500 hover:text-blue-600"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="text-purple-500 hover:text-purple-600"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>

        {currentSession === "work" && currentTask && (
          <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <strong>Current task:</strong> {currentTask}
          </div>
        )}

        <div className="text-6xl font-mono font-bold text-gray-800">{formatTime(timeLeft)}</div>

        <Progress
          value={getProgress()}
          className={`w-full h-3 ${currentSession === "work" ? "[&>div]:bg-red-500" : "[&>div]:bg-green-500"}`}
        />

        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={handleStartPause}
            size="lg"
            disabled={currentSession === "work" && !currentTask.trim() && !isRunning}
            className={`px-8 ${
              currentSession === "work" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            } text-white disabled:opacity-50`}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </Button>

          <Button onClick={handleReset} variant="outline" size="lg" className="px-6">
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>

          <Button onClick={handleSkipSession} variant="ghost" size="lg" className="px-6 text-gray-600">
            Skip
          </Button>
        </div>

        {/* Pomodoro Counter */}
        <div className="flex items-center justify-center space-x-2 mt-6">
          <span className="text-sm text-gray-600">Completed Pomodoros:</span>
          <div className="flex space-x-1">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${index < (completedPomodoros % 4) ? "bg-red-500" : "bg-gray-200"}`}
              />
            ))}
          </div>
          <Badge variant="outline" className="ml-2">
            {completedPomodoros} total
          </Badge>
        </div>
      </div>
    </div>
  )
}


