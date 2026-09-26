export const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID || '9431f782-ceba-4672-a2b9-85e0c44bdd0f';
export const CLIENT_SLUG = process.env.NEXT_PUBLIC_CLIENT_SLUG || 'ajsvritti';

export const COMPANY_DETAILS = {
  name: 'AJS Vritti Vision Marketing Private Limited',
  brandName: 'AJS Vritti Vision Marketing',
  email: 'ajsvrttivision@gmail.com',
  domain: 'ajsvision.shop',
  orderIdPrefix: 'AJS',
};

// State the seller is registered in (GST place of supply). The GSTIN itself is not
// known yet; intra-state orders split GST into CGST+SGST, everything else is IGST.
export const SELLER_STATE = 'Delhi';
