const { getSuggestedPrice, generateTitle } = require('../controllers/aiController');
const aiService = require('../services/aiService');

jest.mock('../services/aiService');

describe('AI Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { query: {}, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getSuggestedPrice', () => {
        it('should return suggested price', async () => {
            req.query = { town: 'Colombo', beds: '2', baths: '1' };
            aiService.executeScript.mockResolvedValue({ suggested_price: 50000 });

            await getSuggestedPrice(req, res, next);

            expect(aiService.executeScript).toHaveBeenCalledWith('pricing_engine.py', expect.objectContaining({
                town: 'Colombo',
                beds: 2
            }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ suggested_price: 50000 });
        });

        it('should return 400 if town is missing', async () => {
            req.query = { beds: '2' }; // Missing town

            await getSuggestedPrice(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('generateTitle', () => {
        it('should generate a title', async () => {
            req.body = { type: 'House', beds: 3, town: 'Kandy' };
            aiService.executeScript.mockResolvedValue({ title: 'Beautiful House in Kandy' });

            await generateTitle(req, res, next);

            expect(aiService.executeScript).toHaveBeenCalledWith('title_generator.py', expect.objectContaining({
                town: 'Kandy',
                type: 'House'
            }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ title: 'Beautiful House in Kandy' });
        });
    });

    describe('getReviewSentiment', () => {
        const { getReviewSentiment } = require('../controllers/aiController');
        const Review = require('../models/Review');
        jest.mock('../models/Review');

        it('should return review sentiment for a listing', async () => {
            req.params = { listingId: 'listing123' };
            const mockReviews = [
                { _id: 'r1', comment: 'Great place!', rating: 5 },
                { _id: 'r2', comment: 'Too noisy.', rating: 2 }
            ];

            // Mock Review.find().select()
            const selectMock = jest.fn().mockResolvedValue(mockReviews);
            const findMock = jest.spyOn(Review, 'find').mockReturnValue({
                select: selectMock
            });

            aiService.executeScript.mockResolvedValue({
                overallScore: 70,
                reviewSentiments: [
                    { reviewId: 'r1', score: 90, label: 'positive' },
                    { reviewId: 'r2', score: 30, label: 'negative' }
                ]
            });

            await getReviewSentiment(req, res, next);

            expect(Review.find).toHaveBeenCalledWith({ listing: 'listing123' });
            expect(aiService.executeScript).toHaveBeenCalledWith('sentiment_analyzer.py', expect.objectContaining({
                reviews: expect.arrayContaining([
                    expect.objectContaining({ _id: 'r1', comment: 'Great place!' })
                ])
            }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ overallScore: 70 }));
        });
    });
});
