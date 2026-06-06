import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import GlassCard from '../../components/ui/GlassCard';
import { 
  ArrowLeft, 
  Sparkles, 
  Star, 
  Zap, 
  DollarSign, 
  ThumbsUp, 
  Calendar, 
  TrendingDown,
  Building,
  CheckCircle2
} from 'lucide-react';

export const QuoteComparison = () => {
  const { rfqId } = useParams();
  const { quotations, rfqs, vendors } = useApp();

  const rfq = rfqs.find(r => r.id === rfqId);
  const rfqQuotes = quotations.filter(q => q.rfqId === rfqId);

  if (!rfq || rfqQuotes.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">No quotes submitted to compare</h3>
        <Link to="/rfqs" className="text-xs text-primary hover:underline flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to RFQs
        </Link>
      </div>
    );
  }

  // Inject ratings into quote records from vendor profiles
  const comparisonData = rfqQuotes.map(quote => {
    const vendorProfile = vendors.find(v => v.id === quote.vendorId);
    return {
      ...quote,
      rating: vendorProfile ? vendorProfile.rating : 4.0
    };
  });

  // Calculate high/low metrics
  const prices = comparisonData.map(q => q.grandTotal);
  const deliveries = comparisonData.map(q => q.deliveryDays);
  const ratings = comparisonData.map(q => q.rating);

  const minPrice = Math.min(...prices);
  const minDelivery = Math.min(...deliveries);
  const maxRating = Math.max(...ratings);

  // AI Recommendation Engine:
  // Compiles scores based on weightings: 60% price, 20% delivery speed, 20% ratings.
  // Lower score is better.
  const getAIRecommended = () => {
    let bestQuote = comparisonData[0];
    let bestScore = Infinity;

    comparisonData.forEach(q => {
      // Normalize values (0 to 1 scale)
      const normPrice = q.grandTotal / Math.max(...prices);
      const normDelivery = q.deliveryDays / Math.max(...deliveries);
      const normRating = 1 - (q.rating / 5); // invert since higher is better

      const compositeScore = (normPrice * 0.6) + (normDelivery * 0.2) + (normRating * 0.2);
      if (compositeScore < bestScore) {
        bestScore = compositeScore;
        bestQuote = q;
      }
    });

    // Custom brief reasoning
    let brief = '';
    if (bestQuote.grandTotal === minPrice && bestQuote.deliveryDays === minDelivery) {
      brief = `${bestQuote.vendorName} offers both the lowest price ($${bestQuote.grandTotal.toLocaleString()}) and the fastest delivery timeline (${bestQuote.deliveryDays} days). Selection is optimized across all categories.`;
    } else if (bestQuote.grandTotal === minPrice) {
      brief = `${bestQuote.vendorName} provides the most competitive cost proposal at $${bestQuote.grandTotal.toLocaleString()}, yielding a saving of $${(Math.max(...prices) - minPrice).toLocaleString()} over alternative bids.`;
    } else {
      brief = `${bestQuote.vendorName} is recommended because they combine strong compliance rating (${(bestQuote.rating || 0).toFixed(1)} ★) and short shipping delays (${bestQuote.deliveryDays} days), offsetting a slight ${(Math.round((bestQuote.grandTotal / minPrice - 1) * 100))}% price variance.`;
    }

    return { quote: bestQuote, reasoning: brief };
  };

  const recommendation = getAIRecommended();

  return (
    <div className="space-y-6">
      
      {/* Back Link */}
      <div>
        <Link to="/rfqs" className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to RFQs</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-border">
        <div>
          <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Campaign comparison</span>
          <h2 className="text-lg font-bold text-slate-800 mt-1">{rfq.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comparing {comparisonData.length} active submissions side-by-side</p>
        </div>
      </div>

      {/* AI RECOMMENDATION CARD WITH PULSING GLOW EFFECT */}
      <GlassCard 
        className="p-6 border-secondary/40 bg-gradient-to-r from-secondary/10 via-slate-900/50 to-primary/10 relative overflow-hidden ring-1 ring-secondary/20 shadow-[0_0_35px_0_rgba(20,184,166,0.15)] animate-pulse-slow"
        hoverEffect={false}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-primary glow-ring-primary">
                <Sparkles className="w-4.5 h-4.5 animate-spin-slow" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-wide">AI Procurement Recommendation</h3>
            </div>
            
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {recommendation.reasoning}
            </p>
          </div>

          <div className="p-4 bg-white/80 border border-border rounded-2xl flex items-center space-x-4">
            <Building className="w-6 h-6 text-primary" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Recommended Vendor</p>
              <p className="text-sm font-black text-slate-800">{recommendation.quote.vendorName}</p>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">Value Match Optimized</span>
            </div>
          </div>
        </div>

        {/* Backdrop mesh light */}
        <div className="absolute right-0 top-0 w-44 h-44 bg-secondary/15 blur-[60px] pointer-events-none rounded-full" />
      </GlassCard>

      {/* Side-by-side cards / Comparison Table grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table representation */}
        <div className="lg:col-span-3">
          <GlassCard className="p-0 overflow-hidden" hoverEffect={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                    <th className="p-4">Evaluated Criteria</th>
                    {comparisonData.map(q => (
                      <th key={q.id} className="p-4 text-center">
                        <p className="font-extrabold text-slate-800 text-sm">{q.vendorName}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5">Bid ID: #{q.id}</p>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {/* Rating row */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-600">Compliance Rating</td>
                    {comparisonData.map(q => (
                      <td key={q.id} className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-slate-800 font-bold">{(q.rating || 0).toFixed(1)}</span>
                          {q.rating === maxRating && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black px-1.5 py-0.5 rounded">
                              Top Rated
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Delivery Days row */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-600">Lead Time (Days)</td>
                    {comparisonData.map(q => (
                      <td key={q.id} className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-800 font-bold">{q.deliveryDays} Days</span>
                          {q.deliveryDays === minDelivery && (
                            <span className="text-[9px] bg-teal-500/10 text-teal-400 border border-teal-500/20 font-black px-1.5 py-0.5 rounded">
                              Fastest
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Price row */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-600">Subtotal Price</td>
                    {comparisonData.map(q => {
                      const sub = q.items.reduce((sum, item) => sum + (item.pricePerUnit * item.qty), 0);
                      return (
                        <td key={q.id} className="p-4 text-center text-slate-700 font-medium">
                          ${sub.toLocaleString()}
                        </td>
                      );
                    })}
                  </tr>

                  {/* GST tax row */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-600">GST / Tax</td>
                    {comparisonData.map(q => (
                      <td key={q.id} className="p-4 text-center text-slate-500 font-mono">
                        ${q.tax.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* Grand Net Total row */}
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-4 text-slate-700">Grand Total Net Cost</td>
                    {comparisonData.map(q => (
                      <td key={q.id} className="p-4 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-primary text-base font-black">
                            ${q.grandTotal.toLocaleString()}
                          </span>
                          {q.grandTotal === minPrice && (
                            <span className="text-[9px] mt-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 font-black px-2 py-0.5 rounded">
                              Lowest Price
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Detail Deep Links */}
                  <tr>
                    <td className="p-4 font-semibold text-slate-500">Deep Evaluation</td>
                    {comparisonData.map(q => (
                      <td key={q.id} className="p-4 text-center">
                        <Link
                          to={`/quotations/${q.id}`}
                          className="inline-flex items-center text-xs font-bold text-primary hover:underline"
                        >
                          View Breakdown
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

      </div>

    </div>
  );
};
export default QuoteComparison;
