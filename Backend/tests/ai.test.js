jest.mock('../services/aiService', () => ({ executeScript: jest.fn() }));
jest.mock('../models/Review', () => ({ find: jest.fn() }));

const { getSuggestedPrice, generateTitle, getReviewSentiment } = require('../controllers/aiController');
const aiService = require('../services/aiService');
const Review = require('../models/Review');

const mockRes = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
});

describe('AI Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { query: {}, body: {}, params: {} };
        res = mockRes();
        next = jest.fn();
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
            req.query = { beds: '2' };

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
        it('returns a neutral result when there are no reviews', async () => {
            req.params = { listingId: 'listing123' };
            Review.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });

            await getReviewSentiment(req, res, next);

            expect(aiService.executeScript).not.toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ overallLabel: 'neutral' }));
        });

        it('should return review sentiment for a listing', async () => {
            req.params = { listingId: 'listing123' };
            const mockReviews = [
                { _id: 'r1', comment: 'Great place!', rating: 5 },
                { _id: 'r2', comment: 'Too noisy.', rating: 2 }
            ];
            Review.find.mockReturnValue({ select: jest.fn().mockResolvedValue(mockReviews) });
            aiService.executeScript.mockResolvedValue({ overallScore: 70 });

            await getReviewSentiment(req, res, next);

            expect(Review.find).toHaveBeenCalledWith({ listing: 'listing123' });
            expect(aiService.executeScript).toHaveBeenCalledWith('sentiment_analyzer.py', {
                reviews: [
                    { _id: 'r1', comment: 'Great place!', rating: 5 },
                    { _id: 'r2', comment: 'Too noisy.', rating: 2 }
                ]
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ overallScore: 70 });
        });
    });
});
