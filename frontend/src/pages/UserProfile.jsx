import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [testCount, setTestCount] = useState(0); // Track number of tests taken

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/users/${id}`);
        setUser(res.data.data);
        setFormData({
          fullname: res.data.data.fullname || "",
          email: res.data.data.email || "",
          headline: res.data.data.headline || "",
          bio: res.data.data.bio || "",
          skills: res.data.data.skills || [],
          hourlyRate: res.data.data.hourlyRate || 0,
          companyName: res.data.data.companyName || "",
        });
        setTestCount(res.data.data.testCount || 0); // initialize test count
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await axiosInstance.patch("/users/me", { ...formData });
      if (res.status === 200) {
        setUser(res.data.data || { ...user, ...formData });
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleTakeTest = async () => {
    const newCount = testCount + 1;
    setTestCount(newCount);

    // Update backend test count
    try {
      await axiosInstance.patch(`/users/${authUser._id}/update-test-count`, {
        testCount: newCount,
      });
    } catch (error) {
      console.error("Failed to update test count:", error);
    }

    navigate("/mcq-test");
  };

  const getLevel = () => {
    if (testCount >= 10) return "Expert";
    if (testCount >= 5) return "Intermediate";
    return "Beginner";
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-16 w-16 rounded-full mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 text-center text-muted-foreground">
        <p>User not found.</p>
      </div>
    );
  }

  const isOwner = authUser?._id === user._id;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.fullname} />
              <AvatarFallback>{user.fullname?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold">
                {user.fullname}
              </CardTitle>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">{getLevel()}</Badge>
            <Button onClick={handleTakeTest}>Take a Test</Button>

            {/* Only owner can edit */}
            {isOwner && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Common fields */}
                    <div className="space-y-1">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Role-based fields */}
                    {user.role === "student" && (
                      <>
                        <div className="space-y-1">
                          <Label htmlFor="headline">Headline</Label>
                          <Input
                            id="headline"
                            name="headline"
                            value={formData.headline}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="skills">Skills</Label>
                          <Input
                            id="skills"
                            name="skills"
                            value={formData.skills?.join(", ")}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                skills: e.target.value
                                  .split(",")
                                  .map((s) => s.trim()),
                              }))
                            }
                          />
                          <p className="text-xs text-muted-foreground">
                            Separate skills with commas
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                          <Input
                            id="hourlyRate"
                            name="hourlyRate"
                            type="number"
                            value={formData.hourlyRate}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}
                    {user.role === "client" && (
                      <div className="space-y-1">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-4">
          {/* Student extras */}
          {user.role === "student" && (
            <>
              {user.headline && (
                <p className="italic text-muted-foreground">{user.headline}</p>
              )}
              {user.bio && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Bio</h3>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}
              {user.skills?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {user.hourlyRate > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Hourly Rate</h3>
                  <p className="text-sm text-muted-foreground">
                    ${user.hourlyRate}/hr
                  </p>
                </div>
              )}
            </>
          )}

          {/* Client extras */}
          {user.role === "client" && user.companyName && (
            <div>
              <h3 className="text-sm font-medium mb-1">Company</h3>
              <p className="text-sm text-muted-foreground">
                {user.companyName}
              </p>
            </div>
          )}

          {/* Common footer */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Role:</span>
            <span className="capitalize">{user.role}</span>

            <span className="text-muted-foreground">Joined:</span>
            <span>{new Date(user.createdAt).toLocaleDateString()}</span>

            <span className="text-muted-foreground">Rating:</span>
            <span className="flex items-center gap-1">
              {user.rating}
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </span>

            <span className="text-muted-foreground">Tests Taken:</span>
            <span>{testCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
