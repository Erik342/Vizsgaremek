'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './insurances.module.css';

interface InsuranceDetail {
  eletbiztositas_id?: number;
  eletbiztositas_nev?: string;
  szuletesi_datum?: string;
  kockazati_szint?: string;
  lakasbiztositas_id?: number;
  ingatlan_tipus?: string;
  ingatlan_ertek?: number;
  biztositas_tipusa_lakas?: string;
  gepjarmubiztositas_id?: number;
  rendszam?: string;
  alvazszam?: string;
  gyartmany?: string;
  gepjarmu_tipus?: string;
  gyartasi_ev?: number;
  biztositas_tipusa_gepjarmu?: string;
}

interface Insurance extends InsuranceDetail {
  id: number;
  felhasznalo_id: number;
  tipus: 'elet' | 'lakas' | 'gepjarmu';
  kotesi_datum: string;
  ervenyes_tol: string;
  ervenyes_ig: string | null;
  havi_dij: number;
  statusz: 'aktiv' | 'szuneteltetett' | 'megszunt';
}

interface BindingFormData {
  tipus: 'elet' | 'lakas' | 'gepjarmu' | '';
  havi_dij: string;
  ervenyes_tol: string;
  ervenyes_ig: string;
  nev: string;
  lakcim: string;
  szemelyigazolvan_szam: string;
  adoszam: string;
  taj_szam: string;
  telefonszam: string;
  email: string;
  szuletesi_datum: string;
  nemzetiseg: string;
  rendszam: string;
  alvazszam: string;
  gyartmany: string;
  gepjarmu_tipus: string;
  gyartasi_ev: string;
  biztositas_tipusa_gepjarmu: 'kotelezo' | 'casco' | 'casco+kotelezo' | '';
  ingatlan_tipus: 'tarsashaz' | 'csaladi_haz' | 'ikerhaz' | 'egyeb' | '';
  ingatlan_ertek: string;
  biztositas_tipusa_lakas: 'teljeskoru' | 'alap' | 'tuz' | 'vizkar' | 'lopas' | '';
  biztosított_nev: string;
  kockazati_szint: 'alacsony' | 'kozepes' | 'magas' | '';
  alairas: string;
}

const insuranceOptions = {
  elet: {
    name: 'Életbiztosítás',
    price: 5000,
    description: 'Véd téged és szeretteidet a váratlan események ellen.',
    coverage: ['Haláleset biztosítása', 'Rokkantsági védelem', 'Kritikus betegség fedezete']
  },
  lakas: {
    name: 'Lakásbiztosítás',
    price: 8000,
    description: 'Biztosítja az ingatlanodat a veszélyek ellen.',
    coverage: ['Tűzvédelem', 'Áradás fedezet', 'Lopás biztosítás', 'Behatolásos rongálás']
  },
  gepjarmu: {
    name: 'Gépjárműbiztosítás',
    price: 12000,
    description: 'Fedezi a gépjárműved a balesetek és egyéb kockázatok ellen.',
    coverage: ['Kötelező felelősségbiztosítás', 'CASCO biztosítás', 'Szállított tárgyak védelme']
  }
};

export default function Insurances() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading } = useAuth();
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showBindingForm, setShowBindingForm] = useState(false);
  const [bindingLoading, setBindingLoading] = useState(false);
  const [bindingError, setBindingError] = useState('');
  const [formData, setFormData] = useState<BindingFormData>({
    tipus: '',
    havi_dij: '',
    ervenyes_tol: '',
    ervenyes_ig: '',
    nev: user?.nev || '',
    lakcim: '',
    szemelyigazolvan_szam: '',
    adoszam: '',
    taj_szam: '',
    telefonszam: '',
    email: user?.email || '',
    szuletesi_datum: '',
    nemzetiseg: 'magyar',
    rendszam: '',
    alvazszam: '',
    gyartmany: '',
    gepjarmu_tipus: '',
    gyartasi_ev: '',
    biztositas_tipusa_gepjarmu: '',
    ingatlan_tipus: '',
    ingatlan_ertek: '',
    biztositas_tipusa_lakas: '',
    biztosított_nev: '',
    kockazati_szint: '',
    alairas: '',
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/');
      return;
    }

    if (!isLoading && isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        nev: user.nev || '',
        email: user.email || ''
      }));
      fetchInsurances();
    }
  }, [isLoggedIn, isLoading, router, user]);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/insurances', {
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        setInsurances(data.insurances || []);
      } else {
        setError(data.error || 'Hiba a biztosítások betöltésekor');
      }
    } catch (err) {
      setError('Hiba a biztosítások betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'tipus') {
      const selectedType = value as keyof typeof insuranceOptions;
      if (selectedType in insuranceOptions) {
        setFormData(prev => ({
          ...prev,
          havi_dij: insuranceOptions[selectedType].price.toString()
        }));
      }
    }
  };

  const handleSubmitBinding = async (e: React.FormEvent) => {
    e.preventDefault();
    setBindingError('');

    if (!formData.tipus || !formData.nev || !formData.lakcim || !formData.szemelyigazolvan_szam) {
      setBindingError('Kérjük töltsd ki az összes kötelező mezőt');
      return;
    }

    if (formData.tipus === 'gepjarmu' && !formData.rendszam) {
      setBindingError('Gépjárműbiztosításnál a rendszám kötelező');
      return;
    }

    if (formData.tipus === 'lakas' && !formData.ingatlan_ertek) {
      setBindingError('Lakásbiztosításnál az ingatlan értéke kötelező');
      return;
    }

    try {
      setBindingLoading(true);
      const response = await fetch('/api/insurances', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowBindingForm(false);
        setFormData({
          tipus: '',
          havi_dij: '',
          ervenyes_tol: '',
          ervenyes_ig: '',
          nev: user?.nev || '',
          lakcim: '',
          szemelyigazolvan_szam: '',
          adoszam: '',
          taj_szam: '',
          telefonszam: '',
          email: user?.email || '',
          szuletesi_datum: '',
          nemzetiseg: 'magyar',
          rendszam: '',
          alvazszam: '',
          gyartmany: '',
          gepjarmu_tipus: '',
          gyartasi_ev: '',
          biztositas_tipusa_gepjarmu: '',
          ingatlan_tipus: '',
          ingatlan_ertek: '',
          biztositas_tipusa_lakas: '',
          biztosított_nev: '',
          kockazati_szint: '',
          alairas: '',
        });
        fetchInsurances();
      } else {
        setBindingError(data.error || 'Hiba a biztosítás kötésekor');
      }
    } catch (err) {
      setBindingError('Hiba a biztosítás kötésekor');
    } finally {
      setBindingLoading(false);
    }
  };

  const getStatusBadgeClass = (statusz: string): string => {
    switch (statusz) {
      case 'aktiv':
        return styles['status-active'];
      case 'szuneteltetett':
        return styles['status-suspended'];
      case 'megszunt':
        return styles['status-terminated'];
      default:
        return styles['status-active'];
    }
  };

  const getStatusLabel = (statusz: string): string => {
    switch (statusz) {
      case 'aktiv':
        return 'Aktív';
      case 'szuneteltetett':
        return 'Szüneteltetett';
      case 'megszunt':
        return 'Megszűnt';
      default:
        return statusz;
    }
  };

  const getTypeLabel = (tipus: string): string => {
    switch (tipus) {
      case 'elet':
        return 'Életbiztosítás';
      case 'lakas':
        return 'Lakásbiztosítás';
      case 'gepjarmu':
        return 'Gépjárműbiztosítás';
      default:
        return tipus;
    }
  };
  const getRiskLevelLabel = (szint: string): string => {
    switch (szint) {
      case 'alacsony':
        return 'Alacsony';
      case 'kozepes':
        return 'Közepes';
      case 'magas':
        return 'Magas';
      default:
        return szint;
    }
  };

  const getPropertyTypeLabel = (tipus: string): string => {
    switch (tipus) {
      case 'tarsashaz':
        return 'Társasház';
      case 'csaladi_haz':
        return 'Családi ház';
      case 'ikerhaz':
        return 'Ikerhaz';
      case 'egyeb':
        return 'Egyéb';
      default:
        return tipus;
    }
  };

  const getInsuranceTypeLabel = (tipos: string): string => {
    switch (tipos) {
      case 'teljeskoru':
        return 'Teljes körű';
      case 'alap':
        return 'Alap';
      case 'tuz':
        return 'Tűz';
      case 'vizkar':
        return 'Vízkar';
      case 'lopas':
        return 'Lopás';
      case 'kotelezo':
        return 'Kötelező';
      case 'casco':
        return 'CASCO';
      case 'casco+kotelezo':
        return 'CASCO + Kötelező';
      default:
        return tipos;
    }
  };

  if (isLoading || !isLoggedIn || !user) {
    return <div className={styles['loading']}>Betöltés...</div>;
  }

  return (
    <div className={styles['insurances-container']}>
      <header className={styles['insurances-header']}>
        <div className={styles['header-content']}>
          <div className={styles['header-left']}>
            <h1 className={styles['insurances-title']}>Biztosítások</h1>
            <p className={styles['insurances-subtitle']}>Kezeld a te biztosítási szerződéseidet</p>
          </div>
          <a href="/profile" className={styles['back-link']}>
            ← Vissza a Profilra
          </a>
        </div>
      </header>

      <main className={styles['insurances-main']}>
        {!showBindingForm && (
          <div className={styles['section-header']}>
            <h2 className={styles['section-subtitle']}>Szerződések Kezelése</h2>
            <button
              onClick={() => setShowBindingForm(true)}
              className={styles['bind-insurance-button']}
            >
              + Új Biztosítás Kötése
            </button>
          </div>
        )}

        {showBindingForm ? (
          <section className={styles['binding-form-section']}>
            <button
              onClick={() => setShowBindingForm(false)}
              className={styles['back-form-button']}
            >
              ← Vissza
            </button>

            <h2 className={styles['form-title']}>Új Biztosítás Kötése</h2>

            {bindingError && (
              <div className={styles['error-message']}>{bindingError}</div>
            )}

            <form onSubmit={handleSubmitBinding} className={styles['binding-form']}>
              <div className={styles['form-section']}>
                <h3 className={styles['form-section-title']}>Biztosítás Típusa</h3>

                <div className={styles['insurance-selection']}>
                  {Object.entries(insuranceOptions).map(([key, option]) => (
                    <div
                      key={key}
                      className={`${styles['insurance-option']} ${formData.tipus === key ? styles['selected'] : ''}`}
                      onClick={() => handleFormChange({ target: { name: 'tipus', value: key } } as any)}
                    >
                      <input
                        type="radio"
                        name="tipus"
                        value={key}
                        checked={formData.tipus === key}
                        onChange={handleFormChange}
                        style={{ display: 'none' }}
                      />
                      <div className={styles['option-header']}>
                        <h4 className={styles['option-name']}>{option.name}</h4>
                        <span className={styles['option-price']}>{option.price.toLocaleString('hu-HU')} Ft/hó</span>
                      </div>
                      <p className={styles['option-description']}>{option.description}</p>
                      <ul className={styles['option-coverage']}>
                        {option.coverage.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {formData.tipus && (
                <>
                  <div className={styles['form-section']}>
                    <h3 className={styles['form-section-title']}>Szerződés Adatai</h3>

                    <div className={styles['form-row']}>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Érvényes kezdete *</label>
                        <input
                          type="date"
                          name="ervenyes_tol"
                          value={formData.ervenyes_tol}
                          onChange={handleFormChange}
                          required
                          className={styles['form-input']}
                        />
                      </div>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Érvényes vége</label>
                        <input
                          type="date"
                          name="ervenyes_ig"
                          value={formData.ervenyes_ig}
                          onChange={handleFormChange}
                          className={styles['form-input']}
                        />
                      </div>
                    </div>
                  </div>

                  <div className={styles['form-section']}>
                    <h3 className={styles['form-section-title']}>Személyes Adatok</h3>

                    <div className={styles['form-row']}>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Teljes Név *</label>
                        <input
                          type="text"
                          name="nev"
                          value={formData.nev}
                          onChange={handleFormChange}
                          required
                          className={styles['form-input']}
                        />
                      </div>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Lakcím *</label>
                        <input
                          type="text"
                          name="lakcim"
                          value={formData.lakcim}
                          onChange={handleFormChange}
                          required
                          placeholder="pl. Budapest, Fő utca 1."
                          className={styles['form-input']}
                        />
                      </div>
                    </div>

                    <div className={styles['form-row']}>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Személyigazolvány szám *</label>
                        <input
                          type="text"
                          name="szemelyigazolvan_szam"
                          value={formData.szemelyigazolvan_szam}
                          onChange={handleFormChange}
                          required
                          placeholder="pl. 123456AB"
                          className={styles['form-input']}
                        />
                      </div>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Születési dátum</label>
                        <input
                          type="date"
                          name="szuletesi_datum"
                          value={formData.szuletesi_datum}
                          onChange={handleFormChange}
                          className={styles['form-input']}
                        />
                      </div>
                    </div>

                    <div className={styles['form-row']}>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Adószám</label>
                        <input
                          type="text"
                          name="adoszam"
                          value={formData.adoszam}
                          onChange={handleFormChange}
                          placeholder="pl. 12345678-9-12"
                          className={styles['form-input']}
                        />
                      </div>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>TAJ szám</label>
                        <input
                          type="text"
                          name="taj_szam"
                          value={formData.taj_szam}
                          onChange={handleFormChange}
                          placeholder="pl. 123456789"
                          className={styles['form-input']}
                        />
                      </div>
                    </div>

                    <div className={styles['form-row']}>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Telefonszám</label>
                        <input
                          type="tel"
                          name="telefonszam"
                          value={formData.telefonszam}
                          onChange={handleFormChange}
                          placeholder="pl. +36 30 123 4567"
                          className={styles['form-input']}
                        />
                      </div>
                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          className={styles['form-input']}
                        />
                      </div>
                    </div>

                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Nemzetiség</label>
                      <input
                        type="text"
                        name="nemzetiseg"
                        value={formData.nemzetiseg}
                        onChange={handleFormChange}
                        className={styles['form-input']}
                      />
                    </div>
                  </div>

                  {formData.tipus === 'gepjarmu' && (
                    <div className={styles['form-section']}>
                      <h3 className={styles['form-section-title']}>Gépjármű Adatai</h3>

                      <div className={styles['form-row']}>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Rendszám *</label>
                          <input
                            type="text"
                            name="rendszam"
                            value={formData.rendszam}
                            onChange={handleFormChange}
                            required
                            placeholder="pl. ABC-123"
                            className={styles['form-input']}
                          />
                        </div>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Gyártási év</label>
                          <input
                            type="number"
                            name="gyartasi_ev"
                            value={formData.gyartasi_ev}
                            onChange={handleFormChange}
                            placeholder="pl. 2020"
                            className={styles['form-input']}
                          />
                        </div>
                      </div>

                      <div className={styles['form-row']}>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Gyártmány</label>
                          <input
                            type="text"
                            name="gyartmany"
                            value={formData.gyartmany}
                            onChange={handleFormChange}
                            placeholder="pl. Audi"
                            className={styles['form-input']}
                          />
                        </div>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Típus</label>
                          <input
                            type="text"
                            name="gepjarmu_tipus"
                            value={formData.gepjarmu_tipus}
                            onChange={handleFormChange}
                            placeholder="pl. A4"
                            className={styles['form-input']}
                          />
                        </div>
                      </div>

                      <div className={styles['form-row']}>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Alvázszám</label>
                          <input
                            type="text"
                            name="alvazszam"
                            value={formData.alvazszam}
                            onChange={handleFormChange}
                            placeholder="pl. WAUZZZ8K5SA..."
                            className={styles['form-input']}
                          />
                        </div>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Biztosítás típusa</label>
                          <select
                            name="biztositas_tipusa_gepjarmu"
                            value={formData.biztositas_tipusa_gepjarmu}
                            onChange={handleFormChange}
                            className={styles['form-select']}
                          >
                            <option value="">Válassz típust</option>
                            <option value="kotelezo">Kötelező</option>
                            <option value="casco">CASCO</option>
                            <option value="casco+kotelezo">CASCO + Kötelező</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.tipus === 'lakas' && (
                    <div className={styles['form-section']}>
                      <h3 className={styles['form-section-title']}>Ingatlan Adatai</h3>

                      <div className={styles['form-row']}>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Ingatlan típusa</label>
                          <select
                            name="ingatlan_tipus"
                            value={formData.ingatlan_tipus}
                            onChange={handleFormChange}
                            className={styles['form-select']}
                          >
                            <option value="">Válassz típust</option>
                            <option value="tarsashaz">Társasház</option>
                            <option value="csaladi_haz">Családi ház</option>
                            <option value="ikerhaz">Ikerhaz</option>
                            <option value="egyeb">Egyéb</option>
                          </select>
                        </div>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Ingatlan értéke (Ft) *</label>
                          <input
                            type="number"
                            name="ingatlan_ertek"
                            value={formData.ingatlan_ertek}
                            onChange={handleFormChange}
                            required
                            placeholder="pl. 50000000"
                            className={styles['form-input']}
                          />
                        </div>
                      </div>

                      <div className={styles['form-group']}>
                        <label className={styles['form-label']}>Biztosítás típusa</label>
                        <select
                          name="biztositas_tipusa_lakas"
                          value={formData.biztositas_tipusa_lakas}
                          onChange={handleFormChange}
                          className={styles['form-select']}
                        >
                          <option value="">Válassz típust</option>
                          <option value="teljeskoru">Teljes körű</option>
                          <option value="alap">Alap</option>
                          <option value="tuz">Tűz</option>
                          <option value="vizkar">Vízkar</option>
                          <option value="lopas">Lopás</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {formData.tipus === 'elet' && (
                    <div className={styles['form-section']}>
                      <h3 className={styles['form-section-title']}>Életbiztosítás Adatai</h3>

                      <div className={styles['form-row']}>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Biztosított neve</label>
                          <input
                            type="text"
                            name="biztosított_nev"
                            value={formData.biztosított_nev}
                            onChange={handleFormChange}
                            placeholder="pl. Lehet más ember is"
                            className={styles['form-input']}
                          />
                        </div>
                        <div className={styles['form-group']}>
                          <label className={styles['form-label']}>Kockázati szint</label>
                          <select
                            name="kockazati_szint"
                            value={formData.kockazati_szint}
                            onChange={handleFormChange}
                            className={styles['form-select']}
                          >
                            <option value="">Válassz szintet</option>
                            <option value="alacsony">Alacsony</option>
                            <option value="kozepes">Közepes</option>
                            <option value="magas">Magas</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={styles['form-section']}>
                    <h3 className={styles['form-section-title']}>Aláírás</h3>
                    <p className={styles['signature-hint']}>Írd be az aláírásod a szerződés aláírásához</p>
                    <div className={styles['signature-input-wrapper']}>
                      <input
                        type="text"
                        name="alairas"
                        value={formData.alairas}
                        onChange={handleFormChange}
                        placeholder="Az aláírásod"
                        className={styles['signature-input']}
                      />
                    </div>
                  </div>

                  <div className={styles['form-actions']}>
                    <button
                      type="button"
                      onClick={() => setShowBindingForm(false)}
                      className={styles['cancel-button']}
                    >
                      Mégsem
                    </button>
                    <button
                      type="submit"
                      disabled={bindingLoading}
                      className={styles['submit-binding-button']}
                    >
                      {bindingLoading ? 'Kötés folyamatban...' : 'Szerződés Kötése'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </section>
        ) : (
          <section className={styles['insurances-section']}>
            {error && <div className={styles['error-message']}>{error}</div>}

            {loading ? (
              <div className={styles['loading-text']}>Betöltés...</div>
            ) : insurances.length === 0 ? (
              <div className={styles['empty-state']}>
                <p>Nincsenek biztosítási szerződéseid</p>
                <p className={styles['empty-state-hint']}>Kattints az "Új Biztosítás Kötése" gombra az első szerződés létrehozásához</p>
              </div>
            ) : (
              <div className={styles['insurances-grid']}>
                {insurances.map((insurance) => (
                  <div
                    key={insurance.id}
                    className={styles['insurance-card']}
                    onClick={() => setExpandedId(expandedId === insurance.id ? null : insurance.id)}
                  >
                    <div className={styles['card-header']}>
                      <div className={styles['card-title-section']}>
                        <h3 className={styles['card-title']}>
                          {getTypeLabel(insurance.tipus)}
                        </h3>
                        <p className={styles['card-subtitle']}>
                          Kötési dátum: {new Date(insurance.kotesi_datum).toLocaleDateString('hu-HU')}
                        </p>
                      </div>
                      <div className={`${styles['status-badge']} ${getStatusBadgeClass(insurance.statusz)}`}>
                        {getStatusLabel(insurance.statusz)}
                      </div>
                    </div>

                    <div className={styles['card-content']}>
                      <div className={styles['content-row']}>
                        <span className={styles['content-label']}>Érvényes:</span>
                        <span className={styles['content-value']}>
                          {new Date(insurance.ervenyes_tol).toLocaleDateString('hu-HU')}
                          {insurance.ervenyes_ig && (
                            <> - {new Date(insurance.ervenyes_ig).toLocaleDateString('hu-HU')}</>
                          )}
                        </span>
                      </div>

                      <div className={styles['content-row']}>
                        <span className={styles['content-label']}>Havi díj:</span>
                        <span className={styles['content-value']}>
                          {Math.round(parseFloat(insurance.havi_dij as any)).toLocaleString('hu-HU')} Ft
                        </span>
                      </div>
                    </div>

                    {expandedId === insurance.id && (
                      <div className={styles['card-details']}>
                        <div className={styles['details-divider']}></div>

                        {insurance.tipus === 'elet' && insurance.eletbiztositas_id ? (
                          <div className={styles['details-section']}>
                            <h4 className={styles['details-title']}>Életbiztosítás Részletei</h4>
                            <div className={styles['details-grid']}>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Biztosított név:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.eletbiztositas_nev}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Születési dátum:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.szuletesi_datum
                                    ? new Date(insurance.szuletesi_datum).toLocaleDateString('hu-HU')
                                    : '-'}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Kockázati szint:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.kockazati_szint
                                    ? getRiskLevelLabel(insurance.kockazati_szint)
                                    : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {insurance.tipus === 'lakas' && insurance.lakasbiztositas_id ? (
                          <div className={styles['details-section']}>
                            <h4 className={styles['details-title']}>Lakásbiztosítás Részletei</h4>
                            <div className={styles['details-grid']}>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Ingatlan típusa:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.ingatlan_tipus
                                    ? getPropertyTypeLabel(insurance.ingatlan_tipus)
                                    : '-'}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Ingatlan értéke:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.ingatlan_ertek
                                    ? Math.round(insurance.ingatlan_ertek).toLocaleString('hu-HU') + ' Ft'
                                    : '-'}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Biztosítás típusa:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.biztositas_tipusa_lakas
                                    ? getInsuranceTypeLabel(insurance.biztositas_tipusa_lakas)
                                    : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null}

                        {insurance.tipus === 'gepjarmu' && insurance.gepjarmubiztositas_id ? (
                          <div className={styles['details-section']}>
                            <h4 className={styles['details-title']}>Gépjárműbiztosítás Részletei</h4>
                            <div className={styles['details-grid']}>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Rendszám:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.rendszam || '-'}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Gyártmány:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.gyartmany || '-'}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Típus:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.gepjarmu_tipus || '-'}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Gyártási év:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.gyartasi_ev || '-'}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Alvázszám:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.alvazszam || '-'}
                                </span>
                              </div>
                              <div className={styles['detail-item']}>
                                <span className={styles['detail-label']}>Biztosítás típusa:</span>
                                <span className={styles['detail-value']}>
                                  {insurance.biztositas_tipusa_gepjarmu
                                    ? getInsuranceTypeLabel(insurance.biztositas_tipusa_gepjarmu)
                                    : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className={styles['card-expand-hint']}>
                      {expandedId === insurance.id ? '▼ Részletek elrejtése' : '▶ Részletek megtekintése'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {!showBindingForm && (
          <section className={styles['info-section']}>
            <h2 className={styles['info-section-title']}>Biztosítási Szerződések Típusai</h2>
            <div className={styles['info-grid']}>
              <div className={styles['info-card']}>
                <h3 className={styles['info-card-title']}>Életbiztosítás</h3>
                <p className={styles['info-card-description']}>
                  Véd téged és szeretteidet a váratlan események ellen. Magában foglalja a kockázati szint alapján a biztosítást.
                </p>
              </div>

              <div className={styles['info-card']}>
                <h3 className={styles['info-card-title']}>Lakásbiztosítás</h3>
                <p className={styles['info-card-description']}>
                  Biztosítja a te ingatlanodat az elemi csapások és egyéb veszélyek ellen. Többféle típusban elérhető.
                </p>
              </div>

              <div className={styles['info-card']}>
                <h3 className={styles['info-card-title']}>Gépjárműbiztosítás</h3>
                <p className={styles['info-card-description']}>
                  Fedezi a te gépjárműved a balesetek és egyéb kockázatok ellen. Kötelező és fakultatív lehetőségek.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
