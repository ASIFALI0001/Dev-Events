import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// TypeScript interface for the Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event', // Reference to the Event model
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries when filtering by eventId
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value: string): boolean {
          // RFC 5322 compliant email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Compound index for preventing duplicate bookings by the same email for the same event
BookingSchema.index({ eventId: 1, email: 1 });

/**
 * Pre-save hook: Validate that the referenced event exists in the database
 * This ensures referential integrity before creating a booking
 */
BookingSchema.pre('save', async function (next) {
  // Only validate eventId on new bookings or when eventId is modified
  if (this.isNew || this.isModified('eventId')) {
    try {
      // Dynamically import Event model to avoid circular dependency issues
      const Event = mongoose.models.Event || (await import('./event.model')).default;
      
      // Check if the event exists in the database
      const eventExists = await Event.exists({ _id: this.eventId });
      
      if (!eventExists) {
        return next(
          new Error(
            `Event with ID ${this.eventId} does not exist. Cannot create booking.`
          )
        );
      }
      
      next();
    } catch (error) {
      return next(
        error instanceof Error
          ? error
          : new Error('Failed to validate event reference')
      );
    }
  } else {
    next();
  }
});

// Export the Booking model, reusing existing model in development to avoid recompilation errors
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
