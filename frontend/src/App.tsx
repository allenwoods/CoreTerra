import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold underline">
        CoreTerra Frontend
      </h1>
      <Button onClick={() => alert("Shadcn Button Works!")}>
        Click me (Shadcn)
      </Button>
    </div>
  )
}

export default App
