import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClassCalendar from '@/components/ClassCalendar';

export default function Calendar() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Class Schedule</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              View our upcoming CPR training classes and register directly from the calendar. 
              Select any class to see details and available spots.
            </p>
          </div>
        </section>

        {/* Calendar Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <ClassCalendar />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}