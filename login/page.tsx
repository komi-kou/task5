"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (isLogin) {
        // ログイン処理
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError("メールアドレスまたはパスワードが正しくありません")
          setIsLoading(false)
        } else if (result?.ok) {
          // セッションが確立されるまで少し待ってからリダイレクト
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 100)
        }
      } else {
        // 新規登録処理
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })

        const data = await res.json()
        
        if (res.ok) {
          // 登録成功後、自動ログイン
          const signInResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          })
          
          if (signInResult?.ok) {
            // セッションが確立されるまで少し待ってからリダイレクト
            setTimeout(() => {
              window.location.href = "/dashboard"
            }, 100)
          } else {
            setError("登録は成功しましたが、ログインに失敗しました")
            setIsLoading(false)
          }
        } else {
          setError(data.error || "登録に失敗しました")
          setIsLoading(false)
        }
      }
    } catch (err) {
      console.error("Auth error:", err)
      setError("エラーが発生しました")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "ログイン" : "新規登録"}</CardTitle>
          <CardDescription>
            {isLogin ? "アカウントにログインしてください" : "新しいアカウントを作成します"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="山田太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "処理中..." : (isLogin ? "ログイン" : "登録")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
              }}
            >
              {isLogin ? "新規登録はこちら" : "ログインはこちら"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}