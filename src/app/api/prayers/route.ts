type Prayer = {
  id: number;
  name: string;
  message: string;
  createdAt: string;
};

// Temporary in-memory store.
// This resets whenever the dev server restarts or the deployment reloads.
let prayers: Prayer[] = [
  {
    id: 1,
    name: "Watcher",
    message: "Lord, guide every soul who enters this altar.",
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return Response.json(prayers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return Response.json(
        { error: "Prayer message is required." },
        { status: 400 }
      );
    }

    const prayer: Prayer = {
      id: Date.now(),
      name: name || "Anonymous",
      message,
      createdAt: new Date().toISOString(),
    };

    prayers = [prayer, ...prayers];

    return Response.json({ success: true, prayer }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}