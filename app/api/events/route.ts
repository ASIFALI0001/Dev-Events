import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';
import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const contentType = req.headers.get('content-type') || '';

        let event: Record<string, unknown>;
        let file: File | null = null;
        let tags: unknown;
        let agenda: unknown;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();

            try {
                event = Object.fromEntries(formData.entries());
            } catch (e) {
                return NextResponse.json({ message: 'Invalid form data format' }, { status: 400 });
            }

            file = formData.get('image') as File | null;

            const rawTags = formData.get('tags');
            const rawAgenda = formData.get('agenda');

            try {
                tags = rawTags ? JSON.parse(rawTags as string) : [];
                agenda = rawAgenda ? JSON.parse(rawAgenda as string) : [];
            } catch {
                return NextResponse.json({ message: 'Invalid JSON in tags or agenda' }, { status: 400 });
            }

        } else if (contentType.includes('application/json')) {
            let body: Record<string, unknown>;

            try {
                body = await req.json();
            } catch {
                return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
            }

            const { tags: rawTags, agenda: rawAgenda, ...rest } = body;
            event = rest;
            tags = rawTags ?? [];
            agenda = rawAgenda ?? [];

        } else {
            return NextResponse.json(
                { message: 'Unsupported Content-Type. Use multipart/form-data or application/json.' },
                { status: 415 }
            );
        }

        // Normalize mode to match schema enum: 'online' | 'offline' | 'hybrid'
        if (typeof event.mode === 'string') {
            const modeLower = event.mode.toLowerCase();
            if (modeLower.includes('hybrid')) event.mode = 'hybrid';
            else if (modeLower.includes('online')) event.mode = 'online';
            else if (modeLower.includes('offline') || modeLower.includes('in-person')) event.mode = 'offline';
        }

        // Handle image upload (multipart) or URL (json)
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'DevEvent' },
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                ).end(buffer);
            });

            event.image = (uploadResult as { secure_url: string }).secure_url;
        } else if (!event.image) {
            return NextResponse.json({ message: 'Image file or image URL is required' }, { status: 400 });
        }

        const createdEvent = await Event.create({
            ...event,
            tags,
            agenda,
        });

        return NextResponse.json(
            { message: 'Event created successfully', event: createdEvent },
            { status: 201 }
        );

    } catch (e) {
        console.error(e);
        return NextResponse.json(
            { message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
    }
}