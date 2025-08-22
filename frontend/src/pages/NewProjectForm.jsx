import { useState } from "react";
import axiosInstance from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export default function NewProjectForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillsRequired: [],
    budget: "",
    deadline: "",
  });

  const [openCalendar, setOpenCalendar] = useState(false);
  const [openSkills, setOpenSkills] = useState(false);

  // 🔹 Example skill list (you can later fetch from backend)
  const allSkills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "UI/UX Design",
    "Machine Learning",
    "Data Analysis",
    "Project Management",
    "Marketing",
  ];

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const alreadySelected = prev.skillsRequired.includes(skill);
      return {
        ...prev,
        skillsRequired: alreadySelected
          ? prev.skillsRequired.filter((s) => s !== skill)
          : [...prev.skillsRequired, skill],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/projects", {
        title: formData.title,
        description: formData.description,
        skillsRequired: formData.skillsRequired,
        budget: Number(formData.budget),
        deadline: formData.deadline || null,
      });

      alert("✅ Project posted successfully!");
      console.log("Project created:", response.data);

      // reset form
      setFormData({
        title: "",
        description: "",
        skillsRequired: [],
        budget: "",
        deadline: "",
      });
    } catch (error) {
      console.error("❌ Error posting project:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to post project.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 border rounded-xl shadow-sm bg-card max-w-lg mx-auto"
    >
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          placeholder="Enter project title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Describe your project..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      {/* Skills Dropdown */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Skills Required</label>
        <Popover open={openSkills} onOpenChange={setOpenSkills}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openSkills}
              className="w-full justify-between"
            >
              {formData.skillsRequired.length > 0
                ? formData.skillsRequired.join(", ")
                : "Select skills..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search skills..." />
              <CommandList>
                <CommandEmpty>No skills found.</CommandEmpty>
                <CommandGroup>
                  {allSkills.map((skill) => (
                    <CommandItem
                      key={skill}
                      value={skill}
                      onSelect={() => toggleSkill(skill)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.skillsRequired.includes(skill)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {skill}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Budget ($)</label>
        <Input
          type="number"
          min="0"
          placeholder="Enter budget"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          required
        />
      </div>

      {/* Deadline */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Deadline</label>
        <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !formData.deadline && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.deadline
                ? format(new Date(formData.deadline), "PPP")
                : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={
                formData.deadline ? new Date(formData.deadline) : undefined
              }
              onSelect={(date) =>
                setFormData({
                  ...formData,
                  deadline: date ? date.toISOString() : "",
                })
              }
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button type="submit" className="w-full">
        Post Project
      </Button>
    </form>
  );
}
