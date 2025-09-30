
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gradient">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Manage Camps</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Edit, add, or remove upcoming camps.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Update Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Change the images in the photo gallery.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Edit About Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Update team members and company story.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>View Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>See messages from the contact form.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Site Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Global site configurations.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
