/* eslint-disable @typescript-eslint/no-unused-vars */

export async function getSourceFields(projectId: string) {
  return [
    { name: "ProductCode", label: "Product Code", type: "string", required: false },
    { name: "Name", label: "Product Name", type: "string", required: false }
  ];
}

export async function getTargetFields(projectId: string) {
  return [
    { name: "ProductCode__c", label: "Code", type: "string", required: false },
    { name: "ProductName__c", label: "Name", type: "string", required: false },
    // Example: required fields
    // { name: "BillingAccount__c", label: "Billing Account", type: "lookup", required: true }
  ];
}

/* eslint-enable @typescript-eslint/no-unused-vars */
