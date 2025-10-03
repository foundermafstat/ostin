script {
    use portfolio_coach::portfolio_coach;

    fun main(account: &signer) {
        portfolio_coach::initialize(account);
    }
}
