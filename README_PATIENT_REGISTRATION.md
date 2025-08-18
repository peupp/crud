# Patient Registration Module

This is a modular patient registration system that can be easily extracted to a separate repository.

## Structure

```
src/components/patient-registration/
├── PatientForm.tsx          # Main form component
├── StepIndicator.tsx        # Step navigation indicator
├── index.ts                 # Module exports
├── schemas/
│   └── patientSchema.ts     # Zod validation schema
└── steps/
    ├── PersonalInfoStep.tsx # Step 1: Personal information
    ├── ContactStep.tsx      # Step 2: Contact information  
    ├── AddressStep.tsx      # Step 3: Address information
    ├── FamilyStep.tsx       # Step 4: Family information
    └── FinalStep.tsx        # Step 5: Final review
```

## Features

- Multi-step form with 5 steps
- Photo upload with Supabase Storage
- Form validation with Zod
- Responsive design with Tailwind CSS
- TypeScript support
- Modular component architecture

## Dependencies Required

```json
{
  "@hookform/resolvers": "^3.10.0",
  "react-hook-form": "^7.61.1",
  "zod": "^3.25.76",
  "@supabase/supabase-js": "^2.54.0",
  "sonner": "^1.7.4",
  "lucide-react": "^0.462.0"
}
```

## Database Schema

The module expects a `patients` table with these fields:

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  social_name TEXT,
  email TEXT,
  mobile_phone TEXT,
  phone1 TEXT,
  phone2 TEXT,
  cpf TEXT,
  rg TEXT,
  birth_date DATE,
  sex TEXT,
  marital_status TEXT,
  profession TEXT,
  convenio TEXT,
  cep TEXT,
  street TEXT,
  address_number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  mother_name TEXT,
  father_name TEXT,
  observations TEXT,
  vip BOOLEAN DEFAULT false,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## Storage Bucket

Requires a Supabase storage bucket named `patient-attachments` for photo uploads.

## Usage

```tsx
import { PatientForm } from '@/components/patient-registration';

function App() {
  return <PatientForm />;
}
```

## Files to Extract

When creating a separate repository, copy these files:

### Core Components
- `src/components/patient-registration/` (entire folder)
- `src/components/ui/` (UI components from shadcn/ui)

### Configuration Files
- `tailwind.config.ts`
- `src/index.css` (design system)
- `package.json` (dependencies)

### Integration
- Supabase client configuration
- Database migration scripts

## Customization

The module is designed to be easily customizable:

1. **Steps**: Add/remove steps by modifying the steps array and adding new step components
2. **Fields**: Modify the schema in `patientSchema.ts` and update corresponding step components
3. **Styling**: Update the design system in `index.css` and `tailwind.config.ts`
4. **Validation**: Extend the Zod schema for additional validation rules

## Notes

- All colors use HSL format for consistency with the design system
- Components use semantic tokens instead of hardcoded colors
- Form state is managed with react-hook-form for optimal performance
- File uploads are handled asynchronously with progress feedback