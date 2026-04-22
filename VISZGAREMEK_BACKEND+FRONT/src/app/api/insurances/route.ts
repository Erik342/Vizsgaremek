import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Nincs hitelesítés' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Érvénytelen token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      tipus,
      havi_dij,
      ervenyes_tol,
      ervenyes_ig,
      nev,
      lakcim,
      szemelyigazolvan_szam,
      adoszam,
      taj_szam,
      telefonszam,
      email,
      szuletesi_datum,
      nemzetiseg,
      rendszam,
      alvazszam,
      gyartmany,
      gepjarmu_tipus,
      gyartasi_ev,
      biztositas_tipusa_gepjarmu,
      ingatlan_tipus,
      ingatlan_ertek,
      biztositas_tipusa_lakas,
      biztosított_nev,
      kockazati_szint,
      alairas,
    } = body;

    if (!tipus || !havi_dij || !ervenyes_tol || !nev || !lakcim || !szemelyigazolvan_szam) {
      return NextResponse.json(
        { error: 'Kérjük töltsd ki az összes kötelező mezőt' },
        { status: 400 }
      );
    }

    const kotesi_datum = new Date().toISOString().split('T')[0];

    const insertResult = await query(
      `INSERT INTO biztositasi_szerzodesek
      (felhasznalo_id, tipus, kotesi_datum, ervenyes_tol, ervenyes_ig, havi_dij, nev, lakcim, szemelyigazolvan_szam, adoszam, taj_szam, telefonszam, email, szuletesi_datum, nemzetiseg)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [decoded.userId, tipus, kotesi_datum, ervenyes_tol, ervenyes_ig, havi_dij, nev, lakcim, szemelyigazolvan_szam, adoszam || null, taj_szam || null, telefonszam || null, email || null, szuletesi_datum || null, nemzetiseg || null]
    );

    const contractId = (insertResult as any).insertId;

    if (tipus === 'gepjarmu' && rendszam) {
      await query(
        `INSERT INTO gepjarmubiztositas (szerzodes_id, rendszam, alvazszam, gyartmany, tipus, gyartasi_ev, biztositas_tipusa)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [contractId, rendszam, alvazszam || null, gyartmany || null, gepjarmu_tipus || null, gyartasi_ev || null, biztositas_tipusa_gepjarmu || null]
      );
    }

    if (tipus === 'lakas' && ingatlan_ertek) {
      await query(
        `INSERT INTO lakasbiztositas (szerzodes_id, ingatlan_tipus, ingatlan_ertek, biztositas_tipusa)
        VALUES (?, ?, ?, ?)`,
        [contractId, ingatlan_tipus || null, ingatlan_ertek, biztositas_tipusa_lakas || null]
      );
    }

    if (tipus === 'elet' && biztosított_nev) {
      await query(
        `INSERT INTO eletbiztositas (szerzodes_id, biztosított_nev, szuletesi_datum, kockazati_szint)
        VALUES (?, ?, ?, ?)`,
        [contractId, biztosított_nev, szuletesi_datum || null, kockazati_szint || null]
      );
    }

    return NextResponse.json(
      { message: 'Biztosítási szerződés sikeresen kötve', id: contractId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Insurance creation error:', error);
    return NextResponse.json(
      { error: 'Hiba a biztosítás kötésekor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Nincs hitelesítés' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Érvénytelen token' },
        { status: 401 }
      );
    }

    const contracts = await query(
      `SELECT 
        bs.id, 
        bs.felhasznalo_id,
        bs.tipus,
        bs.kotesi_datum,
        bs.ervenyes_tol,
        bs.ervenyes_ig,
        bs.havi_dij,
        bs.statusz,
        COALESCE(eb.id, 0) as eletbiztositas_id,
        COALESCE(eb.biztosított_nev, '') as eletbiztositas_nev,
        COALESCE(eb.szuletesi_datum, NULL) as szuletesi_datum,
        COALESCE(eb.kockazati_szint, '') as kockazati_szint,
        COALESCE(lb.id, 0) as lakasbiztositas_id,
        COALESCE(lb.ingatlan_tipus, '') as ingatlan_tipus,
        COALESCE(lb.ingatlan_ertek, 0) as ingatlan_ertek,
        COALESCE(lb.biztositas_tipusa, '') as biztositas_tipusa_lakas,
        COALESCE(gb.id, 0) as gepjarmubiztositas_id,
        COALESCE(gb.rendszam, '') as rendszam,
        COALESCE(gb.alvazszam, '') as alvazszam,
        COALESCE(gb.gyartmany, '') as gyartmany,
        COALESCE(gb.tipus, '') as gepjarmu_tipus,
        COALESCE(gb.gyartasi_ev, 0) as gyartasi_ev,
        COALESCE(gb.biztositas_tipusa, '') as biztositas_tipusa_gepjarmu
      FROM biztositasi_szerzodesek bs
      LEFT JOIN eletbiztositas eb ON bs.id = eb.szerzodes_id
      LEFT JOIN lakasbiztositas lb ON bs.id = lb.szerzodes_id
      LEFT JOIN gepjarmubiztositas gb ON bs.id = gb.szerzodes_id
      WHERE bs.felhasznalo_id = ?
      ORDER BY bs.kotesi_datum DESC`,
      [decoded.userId]
    );

    return NextResponse.json(
      { insurances: contracts || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Insurances fetch error:', error);
    return NextResponse.json(
      { error: 'Hiba a biztosítások betöltésekor' },
      { status: 500 }
    );
  }
}
