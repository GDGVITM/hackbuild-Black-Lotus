import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon, BookmarkIcon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosInstance from "@/lib/axios";

export default function FindTalent() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("/users/get-students");
        setStudents(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await axiosInstance.post("/users/recommend-users", { query });
      setStudents(res.data?.users || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter job description or required skills..."
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Finding..." : "Find Students"}
        </Button>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.length === 0 ? (
          <p className="text-center text-muted-foreground col-span-full">
            No students found. Try another query.
          </p>
        ) : (
          students.map((student, idx) => (
            <div key={idx} className="block group">
              <Card className="relative rounded-2xl shadow hover:shadow-lg transition-transform transform group-hover:scale-105">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between p-6 pb-2 gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage
                        src={student.avatar}
                        alt={student.fullname}
                      />
                      <AvatarFallback>
                        {student.fullname?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-semibold">
                        {student.fullname}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <BookmarkIcon className="h-6 w-6 text-muted-foreground cursor-pointer" />
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4">
                  {student.headline && (
                    <h2 className="text-lg font-medium">{student.headline}</h2>
                  )}
                  {student.bio && (
                    <p className="text-sm text-muted-foreground">
                      {student.bio}
                    </p>
                  )}

                  {/* Skills */}
                  {student.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {student.skills.map((skill, i) => (
                        <Badge key={i}>{skill}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Hourly Rate & Rating */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-muted-foreground">
                      💵 ${student.hourlyRate || 0}/hr
                    </span>
                    <div className="flex space-x-1">
                      {[...Array(Math.round(student.rating || 0))].map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-yellow-500 fill-yellow-500"
                          />
                        )
                      )}
                      {student.rating === 0 && (
                        <span className="text-sm text-gray-400">No rating</span>
                      )}
                    </div>
                  </div>

                  {/* Profile Links */}
                  <div className="flex items-center space-x-3 mt-3">
                    {student.portfolioLinks?.github && (
                      <a
                        href={student.portfolioLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        GitHub
                      </a>
                    )}
                    {student.portfolioLinks?.website && (
                      <a
                        href={student.portfolioLinks.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-blue-500"
                      >
                        Website
                      </a>
                    )}
                    <Button
                      variant="outline"
                      className="ml-auto flex items-center space-x-1"
                      onClick={() => navigate(`/user-profile/${student._id}`)}
                    >
                      <span className="text-sm">View Profile</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
