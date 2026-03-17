import { useState, useEffect } from 'react';
import { Star, ImagePlus, X } from 'lucide-react';
import { getReviews, submitReview, uploadReviewPhoto } from '@/lib/api';
import type { Review } from '@/types';

interface ReviewSectionProps {
  productId: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(41,36,31,0.22)',
  padding: '10px 14px',
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 300,
  fontSize: '0.82rem',
  color: '#29241f',
  background: 'transparent',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 300,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  fontSize: '0.6rem',
  color: 'rgba(41,36,31,0.5)',
  display: 'block',
  marginBottom: 6,
};

const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    getReviews(productId)
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [productId]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const roundedAvg = Math.round(avgRating * 10) / 10;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setSubmitError('Por favor, escolha uma nota de 1 a 5 estrelas.'); return; }
    if (!authorName.trim()) { setSubmitError('Por favor, informe seu nome.'); return; }
    if (!body.trim()) { setSubmitError('Por favor, escreva sua avaliação.'); return; }

    setSubmitting(true);
    setSubmitError(null);

    let photoUrl: string | null = null;
    if (photoFile) {
      try {
        photoUrl = await uploadReviewPhoto(photoFile);
      } catch {
        // non-fatal — submit without photo
      }
    }

    try {
      await submitReview({
        product_id: productId,
        author_name: authorName.trim(),
        rating,
        body: body.trim(),
        photo_url: photoUrl,
      });
      setSubmitted(true);
      setAuthorName('');
      setRating(0);
      setBody('');
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch {
      setSubmitError('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-20 md:mt-28">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="loi-label block mb-4">avaliações</span>
        <h2 className="heading-display" style={{ fontSize: '2rem', color: '#29241f' }}>
          O que dizem sobre este produto
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={s <= Math.round(avgRating) ? 'fill-current' : ''}
                  style={{ color: s <= Math.round(avgRating) ? '#29241f' : 'rgba(41,36,31,0.18)' }}
                />
              ))}
            </div>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#29241f' }}>
              {roundedAvg} de 5 · {reviews.length} avaliações
            </span>
          </div>
        )}
      </div>

      {/* Review list */}
      {loading ? (
        <p style={{ textAlign: 'center', fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.78rem', color: 'rgba(41,36,31,0.4)' }}>
          Carregando avaliações...
        </p>
      ) : reviews.length === 0 ? (
        <p style={{ textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1rem', color: 'rgba(41,36,31,0.5)' }}>
          Seja o primeiro a avaliar este produto.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 mb-16">
          {reviews.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid rgba(41,36,31,0.1)', paddingBottom: 20 }}>
              {r.photo_url && (
                <img
                  src={r.photo_url}
                  alt="Foto da avaliação"
                  className="w-20 h-20 object-cover mb-3"
                  style={{ border: '1px solid rgba(41,36,31,0.12)' }}
                  loading="lazy"
                />
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s <= r.rating ? 'fill-current' : ''}
                      style={{ color: s <= r.rating ? '#29241f' : 'rgba(41,36,31,0.15)' }}
                    />
                  ))}
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: '0.72rem', color: '#29241f' }}>
                  {r.author_name}
                </span>
                {r.created_at && (
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.68rem', color: 'rgba(41,36,31,0.38)' }}>
                    · {new Date(r.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
              {r.body && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.8rem', color: '#29241f', lineHeight: 1.75 }}>
                  {r.body}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submission form */}
      <div style={{ borderTop: '1px solid rgba(41,36,31,0.12)', paddingTop: 36 }}>
        <h3 className="heading-display mb-8" style={{ fontSize: '1.4rem', color: '#29241f' }}>
          Deixe sua avaliação
        </h3>

        {submitted ? (
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.1rem', color: '#29241f' }}>
            Avaliação recebida. Publicaremos em breve.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
            {/* Author name */}
            <div>
              <label style={labelStyle}>seu nome</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
                maxLength={80}
                placeholder="Como gostaria de ser identificada"
                style={inputStyle}
              />
            </div>

            {/* Star rating picker */}
            <div>
              <label style={labelStyle}>sua nota</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(s)}
                    style={{ padding: '2px 3px', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <Star
                      size={26}
                      className={(hoverRating || rating) >= s ? 'fill-current' : ''}
                      style={{
                        color: (hoverRating || rating) >= s ? '#29241f' : 'rgba(41,36,31,0.2)',
                        transition: 'color 0.1s',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review body */}
            <div>
              <label style={labelStyle}>sua avaliação</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={4}
                maxLength={800}
                placeholder="Conte sua experiência com este produto..."
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Photo upload (optional) */}
            <div>
              <label style={labelStyle}>foto (opcional)</label>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  border: '1px dashed rgba(41,36,31,0.3)',
                  padding: '10px 16px',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 300,
                  fontSize: '0.75rem',
                  color: 'rgba(41,36,31,0.6)',
                }}
              >
                <ImagePlus size={15} />
                {photoFile ? photoFile.name : 'Adicionar foto'}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </label>
              {photoPreview && (
                <div className="relative inline-block mt-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-20 h-20 object-cover"
                    style={{ border: '1px solid rgba(41,36,31,0.15)' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                    className="absolute -top-1 -right-1"
                    style={{
                      background: '#29241f',
                      color: '#f4edd2',
                      border: 'none',
                      borderRadius: '50%',
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* Error message */}
            {submitError && (
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: '0.75rem', color: '#b91c1c' }}>
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="loi-btn"
              style={{ opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? 'enviando...' : 'enviar avaliação'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ReviewSection;
