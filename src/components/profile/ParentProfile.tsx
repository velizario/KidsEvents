import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authAPI } from "@/lib/api";
import { Parent } from "@/types/models";

const ParentProfile = () => {
  const { parentId } = useParams<{ parentId: string }>();
  const [activeTab, setActiveTab] = useState("about");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parent, setParent] = useState<Parent | null>(null);

  useEffect(() => {
    const fetchParentData = async () => {
      if (!parentId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch parent profile
        const parentData = await authAPI.getUserProfile(parentId, "parent");
        setParent(parentData as Parent);
      } catch (err) {
        console.error("Error fetching parent data:", err);
        setError("Failed to load parent data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchParentData();
  }, [parentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading parent profile...</span>
      </div>
    );
  }

  if (error || !parent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-destructive mb-4">
          Error: {error || "Parent not found"}
        </div>
        <Button variant="outline" asChild>
          <Link to="/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Parent Header */}
      <div className="relative h-[200px] md:h-[250px] w-full overflow-hidden bg-primary/10">
        <div className="container mx-auto px-4 h-full flex items-center">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden border-4 border-white shadow-md bg-white">
              <img
                src={
                  parent.imageUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${parent.firstName}`
                }
                alt={`${parent.firstName} ${parent.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {parent.firstName} {parent.lastName}
              </h1>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Parent of {parent.children?.length || 0}{" "}
                {parent.children?.length === 1 ? "child" : "children"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/events">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
          </Link>
        </Button>
      </div>

      {/* Parent Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="children">Children</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {parent.firstName}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="prose max-w-none">
                      <p>
                        Parent since{" "}
                        {new Date(parent.createdAt || Date.now()).getFullYear()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="children" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Children</CardTitle>
                    <CardDescription>
                      Information about {parent.firstName}'s children
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {parent.children && parent.children.length > 0 ? (
                      <div className="space-y-4">
                        {parent.children.map((child) => (
                          <div key={child.id} className="border rounded-lg p-4">
                            <h3 className="font-medium">
                              {child.firstName} {child.lastName}
                            </h3>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Date of Birth
                                </p>
                                <p>{child.dateOfBirth}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  Age
                                </p>
                                <p>{child.age || "Not specified"}</p>
                              </div>
                            </div>
                            {(child.allergies || child.specialNeeds) && (
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {child.allergies && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Allergies
                                    </p>
                                    <p>{child.allergies}</p>
                                  </div>
                                )}
                                {child.specialNeeds && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">
                                      Special Needs
                                    </p>
                                    <p>{child.specialNeeds}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No children added yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-20">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${parent.email}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {parent.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a href={`tel:${parent.phone}`} className="font-medium">
                          {parent.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {parent.address
                            ? `${parent.address}${parent.city ? `, ${parent.city}` : ""}${parent.state ? `, ${parent.state}` : ""}${parent.zipCode ? ` ${parent.zipCode}` : ""}`
                            : "Address not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Button className="w-full" variant="outline" asChild>
                      <Link to="/parent/profile">Edit Profile</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentProfile;
