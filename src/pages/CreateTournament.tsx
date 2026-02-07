import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '@/services/tournamentService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, Users, Settings } from 'lucide-react';

const MAX_PARTICIPANTS_OPTIONS = [4, 8, 16, 32, 64, 128];
const LEGS_OPTIONS = [1, 3, 5, 7];

export function CreateTournament() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_participants: 32,
    game_mode: '501' as '501' | '301',
    double_out: true,
    legs_to_win: 3,
    entry_fee: 0,
    check_in_required: true,
    registration_deadline: '',
  });

  const validateForm = (): string | null => {
    const trimmedName = formData.name.trim();
    if (trimmedName.length < 3) {
      return 'Tournament name must be at least 3 characters';
    }
    if (trimmedName.length > 100) {
      return 'Tournament name must be less than 100 characters';
    }
    if (formData.description.length > 500) {
      return 'Description must be less than 500 characters';
    }
    if (formData.registration_deadline) {
      const deadline = new Date(formData.registration_deadline);
      if (isNaN(deadline.getTime())) {
        return 'Invalid registration deadline';
      }
      if (deadline < new Date()) {
        return 'Registration deadline must be in the future';
      }
    }
    return null;
  };

  const handleCreate = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      setLoading(true);
      
      const tournament = await tournamentService.createTournament({
        name: formData.name.trim(),
        description: formData.description.trim(),
        max_participants: formData.max_participants,
        min_participants: 2,
        game_mode: formData.game_mode,
        entry_fee: formData.entry_fee,
        prize_pool: 0,
        registration_deadline: formData.registration_deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (tournament?.data && tournament.data.id) {
        navigate(`/tournament/${tournament.data.id}`);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = formData.name.trim().length >= 3 && formData.name.length <= 100;
  const isStep2Valid = true; // All step 2 fields have defaults

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <div className="bg-[#111827] border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/tournaments')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Create Tournament</h1>
              <p className="text-gray-400 text-sm">Step {step} of 2</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-800'}`} />
          <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-800'}`} />
        </div>

        {step === 1 ? (
          <Card className="bg-[#111827] border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Basic Information</h2>
                <p className="text-gray-400 text-sm">Name your tournament</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      setFormData({ ...formData, name: e.target.value });
                    }
                  }}
                  maxLength={100}
                  placeholder="e.g., Sunday Night Darts Championship"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setFormData({ ...formData, description: e.target.value });
                    }
                  }}
                  maxLength={500}
                  placeholder="Describe your tournament..."
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Deadline (optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!isStep1Valid}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-8"
              >
                Next Step
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="bg-[#111827] border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Game Settings</h2>
                <p className="text-gray-400 text-sm">Configure your tournament</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Max Participants */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Users className="w-4 h-4 inline mr-1" />
                  Maximum Players
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {MAX_PARTICIPANTS_OPTIONS.map((num) => (
                    <button
                      key={num}
                      onClick={() => setFormData({ ...formData, max_participants: num })}
                      className={`py-3 rounded-lg font-bold transition ${
                        formData.max_participants === num
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Game Mode
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, game_mode: '501' })}
                    className={`flex-1 py-3 rounded-lg font-bold transition ${
                      formData.game_mode === '501'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    501
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, game_mode: '301' })}
                    className={`flex-1 py-3 rounded-lg font-bold transition ${
                      formData.game_mode === '301'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    301
                  </button>
                </div>
              </div>

              {/* Legs to Win */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Legs to Win (Best Of)
                </label>
                <div className="flex gap-2">
                  {LEGS_OPTIONS.map((num) => (
                    <button
                      key={num}
                      onClick={() => setFormData({ ...formData, legs_to_win: num })}
                      className={`flex-1 py-3 rounded-lg font-bold transition ${
                        formData.legs_to_win === num
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkout Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Checkout Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormData({ ...formData, double_out: true })}
                    className={`flex-1 py-3 rounded-lg font-bold transition ${
                      formData.double_out
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Double Out
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, double_out: false })}
                    className={`flex-1 py-3 rounded-lg font-bold transition ${
                      !formData.double_out
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    Straight Out
                  </button>
                </div>
              </div>

              {/* Check-in Required */}
              <div>
                <label className="flex items-center gap-3 p-4 bg-gray-900 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.check_in_required}
                    onChange={(e) => setFormData({ ...formData, check_in_required: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <p className="font-medium text-white">Require Check-in</p>
                    <p className="text-sm text-gray-400">Players must check in before tournament starts</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!isStep2Valid || loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-8"
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
