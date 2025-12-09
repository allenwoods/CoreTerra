import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-4xl font-bold">
        CoreTerra Frontend
      </h1>

      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Shadcn/UI 配置成功 ✓</CardTitle>
          <CardDescription>
            Card 组件已成功添加，说明 shadcn/ui 配置正确
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            这个卡片组件使用了我们刚刚修复的 utils.ts 文件中的 cn() 函数来合并 Tailwind CSS 类名。
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">取消</Button>
          <Button onClick={() => alert("Shadcn Button Works!")}>
            确认
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>项目状态</CardTitle>
          <CardDescription>当前技术栈配置</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">后端:</span>
            <span className="text-muted-foreground">FastAPI + SQLite</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">前端:</span>
            <span className="text-muted-foreground">React + Vite + Tailwind</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">UI 库:</span>
            <span className="text-muted-foreground">shadcn/ui</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
