interface OnboardingProgressProps {
  progress: number
}

export default function OnboardingProgress({ progress }: OnboardingProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-gray-600 font-medium">Progress</span>
        <span className="text-blue-600 font-semibold">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
