import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type LoginMinimalProps = React.ComponentProps<'div'> & {
  redirectTo: (provider: 'google' | 'github') => void;
}

export function LoginMinimal({
  className,
  redirectTo,
  ...props
}: LoginMinimalProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Use your credential from below providers to login 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Button type="button" variant="outline" className="w-full" onClick={() => redirectTo('google')}>
                  Login with Google
                </Button>
                <Button variant="outline" className="w-full" onClick={() => redirectTo('github')}>
                  Login with Github
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}