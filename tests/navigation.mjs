export async function navigate(page,view){
 const phone=await page.evaluate(()=>innerWidth<=600);
 await page.waitForFunction(expected=>!!document.querySelector('[data-phone-more]')===expected,phone);
 const primary=page.locator(`#navigation [data-view="${view}"]`);
 if(await primary.count())return primary.click();
 await page.locator('[data-phone-more]').click();
 await page.locator(`#phoneWorkspaceLinks [data-view="${view}"]`).click();
}
