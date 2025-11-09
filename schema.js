const Joi = require("joi");

// Joi schema for listing validation
const listingSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(""),
    price: Joi.number().min(0),
    location: Joi.string().allow(""),
    country: Joi.string().allow(""),
    propertyType: Joi.string().valid('Entire place', 'Private room', 'Shared room', 'Hotel room'),
    accommodates: Joi.number().min(1),
    bedrooms: Joi.number().min(0),
    bathrooms: Joi.number().min(0.5),
    beds: Joi.number().min(1),
    category: Joi.string().valid(
        'Trending',
        'Rooms',
        'Mountain Cities',
        'Castles',
        'Swimming Pools',
        'Camping Ground',
        'Cow Farms',
        'Bus Side',
        'Sea Beaches',
        'Vacant',
        'Hotel'
    ),
    amenities: Joi.array().items(Joi.string()),
    houseRules: Joi.object({
        checkIn: Joi.string(),
        checkOut: Joi.string(),
        maxGuests: Joi.number().min(1),
        minStay: Joi.number().min(1),
        maxStay: Joi.number().min(1),
        smokingAllowed: Joi.boolean(),
        petsAllowed: Joi.boolean(),
        eventsAllowed: Joi.boolean(),
        additionalRules: Joi.array().items(Joi.string())
    }),
    availability: Joi.object({
        instantBook: Joi.boolean(),
        minAdvanceNotice: Joi.string().valid('Same day', '1 day', '2 days', '3 days', '1 week'),
        maxAdvanceNotice: Joi.string().valid('3 months', '6 months', '9 months', '12 months', 'All dates available')
    }),
    geometry: Joi.object({
        type: Joi.string().valid('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2)
    })
}).unknown(true); // Allow unknown fields for file uploads and other data

// Joi schema for review validation
const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().required().max(2000),
        categoryRatings: Joi.object({
            cleanliness: Joi.number().min(1).max(5),
            communication: Joi.number().min(1).max(5),
            checkIn: Joi.number().min(1).max(5),
            accuracy: Joi.number().min(1).max(5),
            location: Joi.number().min(1).max(5),
            value: Joi.number().min(1).max(5)
        })
    }).required()
});

module.exports = { listingSchema, reviewSchema };

