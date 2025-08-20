import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfile() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 text-center text-muted-foreground">
        <p>You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.fullname?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{user.fullname}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Phone:</span>
            <span>
              {user.countryCode} {user.phoneNumber}
            </span>

            <span className="text-muted-foreground">Address:</span>
            <span>{user.address}</span>

            <span className="text-muted-foreground">Role:</span>
            <span className="capitalize">{user.role}</span>

            <span className="text-muted-foreground">Joined:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <Button onClick={logout} className="mt-4" variant="destructive">
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
