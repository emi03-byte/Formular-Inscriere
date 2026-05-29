import {
  PRIVACY_POLICY_PATH,
  TERMS_PATH,
} from '../content/legalTexts'
import type { ConsentData } from '../types'

type ConsentSectionProps = {
  data: ConsentData
  onChange: (field: keyof ConsentData, value: boolean) => void
}

export function ConsentSection({ data, onChange }: ConsentSectionProps) {
  return (
    <section className="form-section" aria-labelledby="consent-heading">
      <h2 id="consent-heading" className="section-title">
        Politică &amp; Consimțământ
      </h2>
      <p className="section-desc">Vă rugăm să citiți cu atenție</p>

      <div className="policy-box" tabIndex={0} aria-label="Informații GDPR — derulați pentru a citi tot">
        <div className="policy-box-content">
          <h3 className="policy-box-title">
            Prelucrarea datelor cu caracter personal (GDPR)
          </h3>

          <p className="policy-box-text">
            În conformitate cu Regulamentul (UE) 2016/679 privind protecția
            persoanelor fizice în ceea ce privește prelucrarea datelor cu
            caracter personal (GDPR) și legislația națională aplicabilă, vă
            informăm cu privire la modul în care sunt colectate și prelucrate
            datele dumneavoastră prin completarea acestui formular de înscriere.
          </p>

          <h4 className="policy-box-heading">1. Operatorul de date</h4>
          <p className="policy-box-text">
            Operatorul datelor cu caracter personal este organizatorul
            activităților pentru care vă înscrieți copilul/copiii, în calitate
            de responsabil al prelucrării informațiilor furnizate prin acest
            formular.
          </p>

          <h4 className="policy-box-heading">2. Ce date colectăm</h4>
          <p className="policy-box-text">
            Prin acest formular colectăm următoarele categorii de date:
          </p>
          <ul className="policy-box-list">
            <li>
              <strong>Date părinte/tutore:</strong> nume și prenume, adresă de
              email, număr de telefon (opțional);
            </li>
            <li>
              <strong>Date copil:</strong> nume și prenume, vârstă;
            </li>
            <li>
              <strong>Date privind consimțământul:</strong> opțiunile exprimate
              prin bifarea căsuțelor de mai jos;
            </li>
            <li>
              <strong>Semnătură:</strong> semnătura electronică olografă
              desenată în formular.
            </li>
          </ul>

          <h4 className="policy-box-heading">3. Scopul prelucrării</h4>
          <p className="policy-box-text">
            Datele sunt prelucrate exclusiv în scopul:
          </p>
          <ul className="policy-box-list">
            <li>înscrierii și administrării participării copilului la activități;</li>
            <li>comunicării cu părintele/tutorele (confirmări, informări operative);</li>
            <li>gestionării listelor de participanți și a evidențelor necesare organizării;</li>
            <li>respectării obligațiilor legale aplicabile organizatorului;</li>
            <li>
              prelucrărilor suplimentare doar dacă ați dat consimțământ explicit
              (ex.: apariție în materiale foto/video, informări despre activități
              viitoare).
            </li>
          </ul>

          <h4 className="policy-box-heading">4. Temeiul legal</h4>
          <p className="policy-box-text">
            Prelucrăm datele în baza: executării măsurilor precontractuale /
            contractuale (art. 6 alin. (1) lit. b GDPR) — pentru înscriere și
            participare; obligației legale (art. 6 alin. (1) lit. c GDPR), unde
            este cazul; consimțământului explicit (art. 6 alin. (1) lit. a GDPR)
            — pentru opțiunile facultative (apariție în fotografii și clipuri
            video, comunicări marketing).
          </p>

          <h4 className="policy-box-heading">5. Cui dezvăluim datele</h4>
          <p className="policy-box-text">
            Datele pot fi accesibile personalului autorizat al organizatorului.
            Nu vindem și nu transferăm datele către terți în scop comercial.
            Datele pot fi stocate folosind servicii de găzduire securizate,
            strict în scopul funcționării acestui formular. Transferul în afara
            Spațiului Economic European, dacă ar exista, se face numai cu
            garanții adecvate prevăzute de GDPR.
          </p>

          <h4 className="policy-box-heading">6. Perioada de stocare</h4>
          <p className="policy-box-text">
            Păstrăm datele pe durata organizării activităților și pe o perioadă
            rezonabilă ulterior, necesară evidenței participării, soluționării
            eventualelor solicitări sau obligațiilor legale. Datele prelucrate
            în baza consimțământului opțional se păstrează până la retragerea
            consimțământului sau până când scopul prelucrării încetează.
          </p>

          <h4 className="policy-box-heading">7. Drepturile dumneavoastră</h4>
          <p className="policy-box-text">
            În calitate de persoană vizată, aveți următoarele drepturi:
          </p>
          <ul className="policy-box-list">
            <li>dreptul de acces la datele prelucrate;</li>
            <li>dreptul la rectificarea datelor inexacte sau incomplete;</li>
            <li>dreptul la ștergerea datelor („dreptul de a fi uitat”), în condițiile legii;</li>
            <li>dreptul la restricționarea prelucrării;</li>
            <li>dreptul la portabilitatea datelor, când este aplicabil;</li>
            <li>dreptul de opoziție la prelucrare, în condițiile legii;</li>
            <li>
              dreptul de a vă retrage consimțământul în orice moment, pentru
              prelucrările bazate pe consimțământ — fără a afecta legalitatea
              prelucrării efectuate anterior;
            </li>
            <li>
              dreptul de a depune o plângere la Autoritatea Națională de
              Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP).
            </li>
          </ul>

          <h4 className="policy-box-heading">8. Securitatea datelor</h4>
          <p className="policy-box-text">
            Luăm măsuri tehnice și organizatorice rezonabile pentru protejarea
            datelor împotriva accesului neautorizat, pierderii, distrugerii sau
            alterării. Accesul la date este limitat la persoanele care au
            nevoie de ele pentru îndeplinirea atribuțiilor legate de organizarea
            activităților.
          </p>

          <h4 className="policy-box-heading">9. Datele copiilor</h4>
          <p className="policy-box-text">
            Datele copiilor sunt furnizate de părinte sau tutore legal. Nu
            colectăm în mod intenționat date de la minori fără implicarea
            reprezentantului legal. Prin trimiterea formularului confirmați că
            aveți autoritatea de a furniza datele copilului înscris.
          </p>

          <h4 className="policy-box-heading">10. Contact</h4>
          <p className="policy-box-text">
            Pentru exercitarea drepturilor sau pentru întrebări privind protecția
            datelor, ne puteți contacta folosind datele de contact ale
            organizatorului activității (email/telefon comunicat în cadrul
            evenimentului sau al organizației).
          </p>
        </div>
      </div>

      <div className="consent-list">
        <div className="consent-card">
          <input
            type="checkbox"
            id="consent-terms"
            name="consent-terms"
            required
            checked={data.termsAccepted}
            onChange={(e) => onChange('termsAccepted', e.target.checked)}
          />
          <span className="consent-card-text">
            <label htmlFor="consent-terms" className="consent-inline-label">
              Am citit, înțeles și sunt de acord cu
            </label>{' '}
            <a
              href={PRIVACY_POLICY_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="consent-link"
            >
              Politica de Confidențialitate
            </a>{' '}
            <label htmlFor="consent-terms" className="consent-inline-label">
              și cu
            </label>{' '}
            <a
              href={TERMS_PATH}
              target="_blank"
              rel="noopener noreferrer"
              className="consent-link"
            >
              Termenii și Condițiile
            </a>{' '}
            <label htmlFor="consent-terms" className="consent-inline-label">
              de participare. <span className="required-mark">*</span>
            </label>
          </span>
        </div>

        <label className="consent-card">
          <input
            type="checkbox"
            name="consent-media"
            checked={data.mediaAccepted}
            onChange={(e) => onChange('mediaAccepted', e.target.checked)}
          />
          <span className="consent-card-text">
            Declar că am luat la cunoștință faptul că copilul meu poate apărea
            în fotografii și clipuri video realizate în cadrul evenimentului.
          </span>
        </label>

        <label className="consent-card">
          <input
            type="checkbox"
            name="consent-marketing"
            checked={data.marketingAccepted}
            onChange={(e) => onChange('marketingAccepted', e.target.checked)}
          />
          <span className="consent-card-text">
            Doresc să primesc informații despre viitoare activități și tabere prin
            email / SMS.
          </span>
        </label>
      </div>
    </section>
  )
}
