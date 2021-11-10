export default class SignatureImage {
  public image: string;
  public jobTitle: string;
  public name: string;

  constructor (image: string, jobTitle: string, name: string) {
    this.image = image;
    this.jobTitle = jobTitle;
    this.name = name;
  }
}
