/**
 * Assigns undefined properties of an object with given default values.
 * @param options The object to have undefined properties reassigned.
 * @param defaultValues The object containing the default values to be used.
 */
export function fillDefaultValues<T>(options: any, defaultValues: any): T {
  var opt = { ...options };

  Object.entries(defaultValues).forEach(([key, value]) => {
    let optKey = key as keyof typeof opt;

    opt[optKey] ||= value;
  });

  return opt;
}
